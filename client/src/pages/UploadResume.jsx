import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5957';

export default function UploadResume() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [extractedSkills, setExtractedSkills] = useState([]);
  const [suggestedJobs, setSuggestedJobs] = useState([]);
  const [uploadedResumeId, setUploadedResumeId] = useState(null);
  const [uploadedResumeUrl, setUploadedResumeUrl] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [applyingTo, setApplyingTo] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setExtractedSkills([]);
    setSuggestedJobs([]);
    setUploadedResumeId(null);
    setAppliedJobIds([]);
    setDebugInfo(null);

    if (!file) {
      setError('Please select a resume file.');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('phone', form.phone);
    formData.append('position', form.position);
    formData.append('resume', file);

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/resumes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('✅ Resume submitted successfully! We will get back to you soon.');
      
      if (response.data.debug) {
        console.log("Backend Debug Info:", response.data.debug);
        setDebugInfo(response.data.debug);
      }

      if (response.data.data) {
        setUploadedResumeId(response.data.data._id);
        if (response.data.data.filePath) {
          setUploadedResumeUrl(response.data.data.filePath);
        }
        if (response.data.data.skills) {
          setExtractedSkills(response.data.data.skills);
        }
      }
      
      if (response.data.suggestedJobs) {
        setSuggestedJobs(response.data.suggestedJobs);
      }
      setForm({ name: '', email: '', phone: '', position: '' });
      setFile(null);
      // Reset file input
      e.target.reset();
    } catch (err) {
      setError(
        err.response?.data?.message || '❌ Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApply = async (jobId, jobTitle) => {
    if (!uploadedResumeId) return;
    setApplyingTo(jobId);
    try {
      await axios.patch(`${API_URL}/api/resumes/${uploadedResumeId}/apply`, {
        positionTitle: jobTitle
      });

      const token = await getToken();
      await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId,
          resumeUrl: uploadedResumeUrl || 'Applied via Quick Apply',
          coverLetter: 'Applied via Upload Resume AI Matcher.',
          extractedSkills: extractedSkills
        })
      });

      setAppliedJobIds(prev => [...prev, jobId]);
      setSuccess(`✅ Automatically applied! You are now visible to the employer for the ${jobTitle} position.`);
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to apply. Please try again.');
    } finally {
      setApplyingTo(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg mb-4 flex justify-start">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors group text-sm font-medium"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Go Back
        </button>
      </div>
      <div className="w-full max-w-lg bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-white mb-1">Upload Your Resume</h1>
        <p className="text-sm text-gray-400 mb-6">
          Apply for your next opportunity. We'll review your application shortly.
        </p>

        {success && (
          <div className="mb-5 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {extractedSkills.length > 0 && (
          <div className="mb-6 p-5 rounded-xl bg-blue-900/20 border border-blue-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-sm font-semibold text-blue-300">AI Extracted Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {extractedSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs rounded-full shadow-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {suggestedJobs.length > 0 && (
          <div className="mb-6 p-5 rounded-xl bg-purple-900/20 border border-purple-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-sm font-semibold text-purple-300">Suggested Jobs For You</h3>
            </div>
            <div className="space-y-3">
              {suggestedJobs.map((job) => (
                <div key={job._id} className="p-4 bg-white/5 border border-white/10 rounded-lg flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-white">{job.title}</h4>
                    <p className="text-xs text-gray-400 mb-2">{job.company} • {job.location}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-[10px] rounded uppercase font-bold">
                        {job.matchCount}/{job.totalRequirements} Skills Match
                      </span>
                      <span className="text-xs text-gray-400">
                        Matches: {job.matchedSkills.join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center">
                    <button
                      onClick={() => handleQuickApply(job._id, job.title)}
                      disabled={applyingTo === job._id || appliedJobIds.includes(job._id)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        appliedJobIds.includes(job._id)
                          ? 'bg-green-600/20 text-green-400 border border-green-500/30 cursor-default'
                          : 'bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50'
                      }`}
                    >
                      {appliedJobIds.includes(job._id) 
                        ? 'Applied ✓' 
                        : (applyingTo === job._id ? 'Applying...' : 'Quick Apply')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {success && extractedSkills.length === 0 && (
          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-sm text-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No technical skills were extracted.</p>
            </div>
            {debugInfo && (
              <div className="mt-2 text-xs bg-black/30 p-2 rounded border border-gray-700 font-mono text-gray-500 whitespace-pre-wrap overflow-x-auto">
                <p>Debug Log:</p>
                {JSON.stringify(debugInfo, null, 2)}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="+91 9876543210"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Position Applied For
            </label>
            <input
              type="text"
              name="position"
              value={form.position}
              onChange={handleChange}
              required
              placeholder="e.g. Frontend Developer"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Resume File
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              required
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepted: .pdf, .doc, .docx — Max 5MB
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 text-sm"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
