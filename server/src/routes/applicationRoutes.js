const express = require('express');
const { requireAuth, requireAdmin, requireEmployerOrAdmin } = require('../middlewares/auth');
const Application = require('../models/Application');
const User = require('../models/User');
const Job = require('../models/Job');
const AIService = require('../services/aiService');
const multer = require('multer');
const pdfParse = require('pdf-parse');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// @route   POST /api/applications/extract-skills
// @desc    Extract skills from provided resume text via AI
router.post('/extract-skills', requireAuth, async (req, res) => {
    try {
        const { resumeText } = req.body;
        
        if (!resumeText) {
            return res.status(400).json({ error: 'resumeText is required' });
        }

        const skills = await AIService.extractSkills(resumeText);
        
        res.json({
            message: 'Skills extracted successfully',
            skills
        });
    } catch (error) {
        console.error('Error extracting skills:', error);
        res.status(500).json({ error: 'Failed to extract skills via AI.' });
    }
});

// @route   POST /api/applications/match-jobs
// @desc    Match a resume against a given job matrix and return the best matches
router.post('/match-jobs', requireAuth, upload.single('resume'), async (req, res) => {
    try {
        let { jobMatrix } = req.body;
        
        let resumeText = "";
        
        // Use real PDF parsing if a file is provided!
        if (req.file) {
            try {
                if (req.file.originalname.toLowerCase().endsWith('.pdf') || req.file.mimetype.includes('pdf')) {
                    console.log("PDF File detected:", req.file.originalname, "Saved to:", req.file.path);
                    const pdfData = await pdfParse(require('fs').readFileSync(req.file.path));
                    resumeText = pdfData.text;
                    console.log("Successfully extracted text from PDF of length:", resumeText.length);
                    console.log("--- START EXTRACTED TEXT ---");
                    console.log(resumeText.substring(0, 200) + "...");
                    console.log("--- END EXTRACTED TEXT ---");
                } else {
                    console.log("Not a PDF file (mimetype: " + req.file.mimetype + ", name: " + req.file.originalname + "). Cannot parse.");
                }
            } catch (pdfErr) {
                console.error("PDF Parsing error:", pdfErr);
            }
        } else if (req.body.resumeText) {
            resumeText = req.body.resumeText;
        }

        // Deep Fallback: If OCR completely fails, or it was a DOCX/Image, or empty text was found,
        // we use the dynamic filename mock so the frontend never crashes.
        if (!resumeText || resumeText.trim().length < 10) {
            console.log("Resume text empty or invalid. PDF parsing likely failed.");
            resumeText = "NO_CONTENT_EXTRACTED";
        }

        if (!jobMatrix) {
            return res.status(400).json({ error: 'jobMatrix is required' });
        }

        // Parse jobMatrix if it comes as a string from FormData
        try {
            if (typeof jobMatrix === 'string') {
                jobMatrix = JSON.parse(jobMatrix);
            }
        } catch(e) {
            console.error("Failed to parse jobMatrix JSON from FormData");
        }

        const result = await AIService.findMatchingJobs(resumeText, jobMatrix);
        console.log("--- AI Matching Result ---");
        console.log("Extracted Skills count:", result.extracted_skills?.length);
        console.log("Matched Jobs count:", result.matched_jobs?.length);
        console.log("--------------------------");

        res.json({
            message: 'Jobs matched successfully',
            data: result,
            fileUrl: req.file ? `http://localhost:5957/uploads/${req.file.filename}` : null
        });
    } catch (error) {
        console.error('Error matching jobs:', error);
        res.status(500).json({ error: 'Failed to match jobs via AI.' });
    }
});

// @route   POST /api/applications/:id/analyze
// @desc    Trigger AI analysis for a specific application (admin only)
router.post('/:id/analyze', requireAdmin, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id).populate('jobId');
        if (!application) return res.status(404).json({ error: 'Application not found' });

        const jobDescription = `${application.jobId.title} at ${application.jobId.company}. \nRequirements: ${application.jobId.requirements.join(', ')}. \nDescription: ${application.jobId.description}`;
        
        // For now, we analyze using the cover letter or a placeholder for resume text
        // In a real scenario, we'd parse the PDF/Docx from application.resumeUrl
        const analysisText = application.coverLetter || "Candidate applied via platform. Resume available at: " + application.resumeUrl;

        // Perform match scoring and skill extraction
        const { score, feedback } = await AIService.analyzeResumeMatch(analysisText, jobDescription);
        const { extractedSkills, matchPercentage, missingSkills } = await AIService.analyzeSkillsMatch(analysisText, application.jobId.requirements);

        application.aiScore = score;
        application.aiFeedback = feedback;
        application.extractedSkills = extractedSkills;
        application.matchPercentage = matchPercentage;
        application.missingSkills = missingSkills;
        application.status = 'Reviewed'; 
        
        await application.save();

        res.json({
            message: 'Deep AI Analysis complete',
            score,
            matchPercentage,
            extractedSkills,
            missingSkills,
            feedback
        });

    } catch (error) {
        console.error('Error during AI analysis:', error);
        res.status(500).json({ error: 'AI analysis failed. Ensure Ollama is running.' });
    }
});

// @route   POST /api/applications
// @desc    Submit a job application (authenticated users)
router.post('/', requireAuth, async (req, res) => {
    try {
        const { jobId, resumeUrl, coverLetter, aiScore, aiFeedback, extractedSkills, matchPercentage, missingSkills } = req.body;

        const user = await User.findOne({ clerkId: req.auth.userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Check if already applied
        let application = await Application.findOne({ jobId, userId: user._id });
        
        if (application) {
            console.log("--- Updating existing application with new intelligence markers ---");
            application.resumeUrl = resumeUrl;
            application.coverLetter = coverLetter || application.coverLetter;
            application.aiScore = aiScore || application.aiScore;
            application.aiFeedback = aiFeedback || application.aiFeedback;
            application.extractedSkills = extractedSkills || application.extractedSkills;
            application.matchPercentage = matchPercentage || application.matchPercentage;
            application.missingSkills = missingSkills || application.missingSkills;
        } else {
            application = new Application({
                jobId,
                userId: user._id,
                resumeUrl,
                coverLetter,
                aiScore: aiScore || 0,
                aiFeedback: aiFeedback || 'Analysis pending...',
                extractedSkills: extractedSkills || [],
                matchPercentage: matchPercentage || 0,
                missingSkills: missingSkills || []
            });
        }

        // AUTOMATED AI ANALYSIS UPON SUBMISSION (Trigger for all jobs)
        const job = await Job.findById(jobId).populate('postedBy');
        if (job) {
            console.log(`--- Triggering Automated AI Skill Analysis for job: ${job.title} ---`);
            const jobDescription = `${job.title} at ${job.company}. Requirements: ${job.requirements.join(', ')}`;
            const analysisText = coverLetter || "Applied via platform. Resume at: " + resumeUrl;

            try {
                const { score, feedback } = await AIService.analyzeResumeMatch(analysisText, jobDescription);
                const { extractedSkills: aiExtracted, matchPercentage: aiMatch, missingSkills: aiMissing } = await AIService.analyzeSkillsMatch(analysisText, job.requirements);

                application.aiScore = score;
                application.aiFeedback = feedback;
                application.extractedSkills = aiExtracted;
                application.matchPercentage = aiMatch;
                application.missingSkills = aiMissing;
                application.status = 'Reviewed';
            } catch (aiErr) {
                console.error('Automated AI Analysis failed (Silent):', aiErr);
            }
        }

        await application.save();
        res.status(201).json(application);

    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ error: 'Server error while submitting application' });
    }
});

// @route   GET /api/applications
// @desc    Get all applications across all jobs (admin only)
router.get('/', requireAdmin, async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('jobId', 'title company')
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Server error while fetching applications' });
    }
});

// @route   GET /api/applications/employer
// @desc    Get all applications for jobs posted by the logged-in employer
router.get('/employer', requireEmployerOrAdmin, async (req, res) => {
    try {
        const user = req.dbUser;
        // Find jobs posted by this employer or admin
        const jobs = await Job.find({ postedBy: user._id }).select('_id title company');
        const jobIds = jobs.map(j => j._id);
        
        console.log(`[Employer Fetch] User: ${user.firstName || user.email} (${user._id}), Jobs found: ${jobIds.length}`);

        // Find applications for these jobs
        const applications = await Application.find({ jobId: { $in: jobIds } })
            .populate('userId', 'firstName lastName email profileImageUrl')
            .populate('jobId', 'title company')
            .sort({ createdAt: -1 });
        
        console.log(`[Employer Fetch] Applications found: ${applications.length} for Job IDs: ${jobIds}`);

        res.json(applications);
    } catch (error) {
        console.error('Error fetching employer applications:', error);
        res.status(500).json({ error: 'Server error while fetching applications' });
    }
});

// @route   GET /api/applications/:jobId
// @desc    Get applications for a specific job (admin only)
router.get('/:jobId', requireAdmin, async (req, res) => {
    try {
        const applications = await Application.find({ jobId: req.params.jobId })
            .populate('userId', 'firstName lastName email profileImageUrl')
            .sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications for job:', error);
        res.status(500).json({ error: 'Server error while fetching applications' });
    }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status (admin only)
router.put('/:id/status', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Accepted', 'Rejected', 'Reviewed', 'Pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!application) return res.status(404).json({ error: 'Application not found' });

        res.json({
            message: `Application status updated to ${status}`,
            application
        });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ error: 'Failed to update application status' });
    }
});

module.exports = router;
