const express = require('express');
const { requireAuth, requireAdmin, requireEmployerOrAdmin } = require('../middlewares/auth');
const Job = require('../models/Job');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs (public/users)
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Server error while fetching jobs' });
    }
});

// @route   POST /api/jobs
// @desc    Create a new job (employer/admin only)
router.post('/', requireEmployerOrAdmin, async (req, res) => {
    try {
        const { title, company, companyWebsite, location, type, experienceLevel, description, requirements, salaryRange } = req.body;
        
        const newJob = new Job({
            title, company, companyWebsite, location, type, experienceLevel, description, requirements, salaryRange,
            postedBy: req.dbUser._id
        });
        
        await newJob.save();
        res.status(201).json(newJob);
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ error: 'Server error while creating job' });
    }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job (employer/admin only)
router.put('/:id', requireEmployerOrAdmin, async (req, res) => {
    try {
        const { title, company, companyWebsite, location, type, experienceLevel, description, requirements, salaryRange, isActive } = req.body;
        
        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            { 
                title, company, companyWebsite, location, type, experienceLevel, description, 
                requirements: Array.isArray(requirements) ? requirements : requirements?.split(',').map(r => r.trim()), 
                salaryRange,
                isActive 
            },
            { new: true }
        );

        if (!updatedJob) return res.status(404).json({ error: 'Job not found' });
        res.json(updatedJob);
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ error: 'Server error while updating job' });
    }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job (employer/admin only)
router.delete('/:id', requireEmployerOrAdmin, async (req, res) => {
    try {
        const deletedJob = await Job.findByIdAndDelete(req.params.id);
        if (!deletedJob) return res.status(404).json({ error: 'Job not found' });
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ error: 'Server error while deleting job' });
    }
});

// @route   GET /api/jobs/employer
// @desc    Get jobs posted by the logged in employer
router.get('/employer', requireEmployerOrAdmin, async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.dbUser._id }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching employer jobs:', error);
        res.status(500).json({ error: 'Server error while fetching employer jobs' });
    }
});

module.exports = router;
