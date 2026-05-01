import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Briefcase, Plus, TrendingUp, CheckCircle2, ChevronRight, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5957';

export default function EmployerDashboard({ activeView = 'Overview', setActiveView }) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  
  // Job Form State
  const [formData, setFormData] = useState({
    title: '',
    company: user?.firstName ? `${user.firstName}'s Company` : '',
    companyWebsite: '',
    location: '',
    type: 'Full-time',
    experienceLevel: 'Mid Level',
    description: '',
    requirements: '',
    salaryRange: '',
    isActive: true
  });

  const fetchJobs = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/jobs/employer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/applications/employer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCandidates();
  }, [getToken, activeView]);

  const handleEditClick = (job) => {
    setFormData({
      title: job.title,
      company: job.company,
      companyWebsite: job.companyWebsite || '',
      location: job.location,
      type: job.type,
      experienceLevel: job.experienceLevel,
      description: job.description,
      requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements || '',
      salaryRange: job.salaryRange || '',
      isActive: job.isActive ?? true
    });
    setEditingJobId(job._id);
    setIsEditing(true);
    setShowPostJobModal(true);
  };

  const openResume = (url) => {
    if (!url || url === 'Uploaded via Modal') {
      alert("No resume file available for this candidate.");
      return;
    }
    // Clean backslashes and ensure no double leading slashes
    let path = url.replace(/\\/g, '/');
    while (path.startsWith('/')) {
      path = path.substring(1);
    }
    
    const fullUrl = url.startsWith('http') ? url : `${API_URL}/${path}`;
    window.open(fullUrl, '_blank');
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const payload = {
        ...formData,
        requirements: formData.requirements.split('\n').filter(r => r.trim() !== '')
      };
      
      const url = isEditing ? `${API_URL}/api/jobs/${editingJobId}` : `${API_URL}/api/jobs`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowPostJobModal(false);
        setIsEditing(false);
        setEditingJobId(null);
        setFormData({
          title: '',
          company: user?.firstName ? `${user.firstName}'s Company` : '',
          companyWebsite: '',
          location: '',
          type: 'Full-time',
          experienceLevel: 'Mid Level',
          description: '',
          requirements: '',
          salaryRange: '',
          isActive: true
        });
        fetchJobs();
      }
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col flex-grow">
      {/* PAGE HEADER */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-[var(--color-heading)] tracking-tight leading-tight">
            {activeView === 'Overview' ? 'Employer Portal' : activeView === 'Jobs' ? 'Post Jobs' : activeView}
          </h1>
          <p className="text-base text-[var(--color-text-muted)] font-medium italic opacity-80">
            {activeView === 'Overview' ? 'Manage your job postings and find top talent.' : `Manage your ${activeView === 'Jobs' ? 'postings' : activeView.toLowerCase()} here.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 w-full xl:w-auto">
          <button onClick={() => setShowPostJobModal(true)} className="btn-primary py-3 px-8 flex items-center gap-3 text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 pr-10">
            <Plus className="w-4 h-4" /> Post New Job
          </button>
        </div>
      </header>

      {/* OVERVIEW CONTENT */}
      {activeView === 'Overview' && (
        <div className="animate-fade-in">
          {/* METRIC STRIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { label: "Active Postings", value: jobs.length, trend: "Current", color: "text-[var(--color-accent)]" },
              { label: "Total Views", value: jobs.length * 14, trend: "Estimated", color: "text-blue-500" },
              { label: "Applications", value: candidates.length, trend: "Candidates Applied", color: "text-purple-500" },
            ].map((m, i) => (
              <div key={i} className="card-premium space-y-4 group p-8 relative overflow-hidden transition-all duration-500 hover:-translate-y-1">
                <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.3em] opacity-60">{m.label}</p>
                <div className="flex items-baseline justify-between relative z-10">
                  <span className={`text-3xl font-display font-bold tracking-tight ${m.color}`}>{m.value}</span>
                  <TrendingUp className={`w-5 h-5 ${m.color} opacity-40 group-hover:scale-125 transition-transform`} />
                </div>
                <p className="text-[10px] font-black text-[var(--color-heading)] italic opacity-50 tracking-widest">{m.trend}</p>
                <div className={`absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent group-hover:via-[var(--color-accent)]/30 transition-all duration-700`}></div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-display font-bold text-[var(--color-heading)] px-2 tracking-tight">Recent Postings</h2>
            {setActiveView && (
              <button onClick={() => setActiveView('Jobs')} className="text-[var(--color-accent)] text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform">View All Postings</button>
            )}
          </div>
          
          {loading ? (
            <div className="py-20 flex justify-center">
               <div className="w-10 h-10 rounded-full border-4 border-[var(--color-accent)]/20 border-t-[var(--color-accent)] animate-spin"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-16 card-premium glass-premium text-center border-dashed border-2">
               <p className="text-[var(--color-text-muted)] font-bold italic opacity-60 mb-4">You haven't posted any jobs yet.</p>
               <button onClick={() => setShowPostJobModal(true)} className="btn-secondary py-2 px-6 text-xs uppercase tracking-widest">Create First Job</button>
            </div>
          ) : (
            <div className="grid xl:grid-cols-2 gap-8">
              {jobs.slice(0, 2).map((job) => (
                <div key={job._id} className="card-premium flex flex-col justify-between gap-6 relative overflow-hidden p-6 group hover:border-[var(--color-accent)]/30 transition-all">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-display font-bold text-[var(--color-heading)] tracking-tight">{job.title}</h3>
                      <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${job.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {job.isActive ? 'Active' : 'Closed'}
                      </span>
                    </div>
                    <p className="text-sm font-black text-[var(--color-text-muted)] italic opacity-80">{job.location} &bull; {job.type}</p>
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{job.description}</p>
                  </div>
                  <div className="pt-4 border-t border-[var(--color-border)] flex justify-between items-center">
                    <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold">{candidates.filter(c => c.jobId?._id === job._id).length} Applications</span>
                    <button 
                      onClick={() => handleEditClick(job)}
                      className="btn-secondary py-1.5 px-4 text-[9px] uppercase font-black tracking-widest hover:border-[var(--color-accent)] transition-all"
                    >
                      Edit Listing
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* JOBS LIST VIEW */}
      {activeView === 'Jobs' && (
        <div className="space-y-6 animate-fade-in">
          {loading ? (
            <div className="py-20 flex justify-center">
               <div className="w-10 h-10 rounded-full border-4 border-[var(--color-accent)]/20 border-t-[var(--color-accent)] animate-spin"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-16 card-premium glass-premium text-center border-dashed border-2">
               <p className="text-[var(--color-text-muted)] font-bold italic opacity-60 mb-4">You haven't posted any jobs yet.</p>
               <button onClick={() => setShowPostJobModal(true)} className="btn-secondary py-2 px-6 text-xs uppercase tracking-widest">Create First Job</button>
            </div>
          ) : (
            <div className="grid xl:grid-cols-2 gap-8">
              {jobs.map((job) => (
                <div key={job._id} className="card-premium flex flex-col justify-between gap-6 relative overflow-hidden p-6 group hover:border-[var(--color-accent)]/30 transition-all">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-display font-bold text-[var(--color-heading)] tracking-tight">{job.title}</h3>
                      <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${job.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {job.isActive ? 'Active' : 'Closed'}
                      </span>
                    </div>
                    <p className="text-sm font-black text-[var(--color-text-muted)] italic opacity-80">{job.location} &bull; {job.type}</p>
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{job.description}</p>
                  </div>
                  <div className="pt-4 border-t border-[var(--color-border)] flex justify-between items-center">
                    <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold">{candidates.filter(c => c.jobId?._id === job._id).length} Applications</span>
                    <button 
                      onClick={() => handleEditClick(job)}
                      className="btn-secondary py-1.5 px-4 text-[9px] uppercase font-black tracking-widest hover:border-[var(--color-accent)] transition-all"
                    >
                      Edit Listing
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CANDIDATES VIEW */}
      {activeView === 'Candidates' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-display font-bold text-[var(--color-heading)] px-2 tracking-tight">Recent Applicants</h2>
          </div>
          {candidates.length === 0 ? (
            <div className="py-16 card-premium glass-premium text-center border-dashed border-2">
               <p className="text-[var(--color-text-muted)] font-bold italic opacity-60 mb-4">No candidates have applied yet.</p>
            </div>
          ) : (
            <div className="grid xl:grid-cols-2 gap-8">
              {candidates.map((candidate) => (
                <div key={candidate._id} className="card-premium flex flex-col gap-6 relative overflow-hidden p-6 group hover:border-[var(--color-accent)]/30 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      {candidate.userId?.profileImageUrl ? (
                        <img src={candidate.userId.profileImageUrl} alt="Candidate" className="w-12 h-12 rounded-full border-2 border-[var(--color-border)]" />
                      ) : (
                        <div className="w-12 h-12 bg-[var(--color-surface-2)] rounded-full border border-[var(--color-border)] flex items-center justify-center">
                          <span className="text-lg font-black text-[var(--color-accent)] italic opacity-50">{candidate.userId?.firstName?.[0] || 'C'}</span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-[var(--color-heading)] tracking-tight">{candidate.userId?.firstName} {candidate.userId?.lastName}</h3>
                        <p className="text-xs font-black text-[var(--color-text-muted)]">{candidate.userId?.email}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${candidate.status === 'Accepted' ? 'bg-green-500/10 text-green-500' : candidate.status === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {candidate.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-[var(--color-text-muted)]"><span className="font-bold text-[var(--color-text)]">Applied For:</span> {candidate.jobId?.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)]"><span className="font-bold text-[var(--color-text)]">AI Score:</span> <span className="text-[var(--color-accent)] font-bold">{candidate.aiScore || candidate.matchPercentage || 'N/A'}%</span></p>
                  </div>
                  <div className="pt-4 border-t border-[var(--color-border)] flex justify-between items-center gap-2">
                    <button 
                      onClick={() => openResume(candidate.resumeUrl)}
                      className="btn-secondary py-2 flex-1 text-[10px] uppercase font-bold"
                    >
                      See Resume
                    </button>
                    <button className="btn-primary py-2 flex-1 text-[10px] uppercase font-bold">Shortlist</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PLACEHOLDER VIEWS */}
      {activeView === 'Interviews' && (
        <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-in zoom-in duration-500">
           <div className="w-24 h-24 bg-[var(--color-accent)]/10 rounded-[2.5rem] flex items-center justify-center border border-[var(--color-accent)]/20 shadow-inner group">
              <CheckCircle2 className="w-10 h-10 text-[var(--color-accent)] opacity-40 group-hover:opacity-100 transition-opacity animate-pulse" />
           </div>
           <div className="text-center space-y-3">
              <h3 className="text-2xl font-display font-black text-[var(--color-heading)] tracking-tighter italic">{activeView} Optimization</h3>
              <p className="text-sm font-medium text-[var(--color-text-muted)] italic max-w-sm mx-auto opacity-70">Our AI is currently prioritizing your hiring matrix. This module will be synchronized shortly.</p>
           </div>
           {setActiveView && (
             <button onClick={() => setActiveView('Overview')} className="btn-secondary py-3 px-10 text-[10px] font-black uppercase tracking-widest bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-[var(--color-accent)]/30 transition-all">Synchronize Dashboard</button>
           )}
        </div>
      )}

      {/* POST JOB MODAL */}
      {showPostJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[var(--color-bg)] rounded-[2rem] border border-[var(--color-border)] shadow-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-8">
            <button 
              onClick={() => {
                setShowPostJobModal(false);
                setIsEditing(false);
                setEditingJobId(null);
                setFormData({
                  title: '',
                  company: user?.firstName ? `${user.firstName}'s Company` : '',
                  companyWebsite: '',
                  location: '',
                  type: 'Full-time',
                  experienceLevel: 'Mid Level',
                  description: '',
                  requirements: '',
                  salaryRange: '',
                  isActive: true
                });
              }} 
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)] transition-transform hover:scale-110"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h2 className="text-3xl font-display font-black text-[var(--color-heading)] mb-6">
              {isEditing ? 'Edit Job Posting' : 'Post a New Job'}
            </h2>
            <form onSubmit={handlePostJob} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)]">Job Title</label>
                  <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none" placeholder="e.g. Senior Frontend Engineer" />
                </div>
                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)]">Company Name</label>
                  <input required name="company" value={formData.company} onChange={handleChange} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)]">Location</label>
                  <input required name="location" value={formData.location} onChange={handleChange} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none" placeholder="e.g. Remote, New York, NY" />
                </div>
                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)]">Job Type</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none">
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)]">Experience Level</label>
                  <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none">
                    <option>Entry Level</option>
                    <option>Mid Level</option>
                    <option>Senior</option>
                    <option>Executive</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)]">Salary Range</label>
                  <input name="salaryRange" value={formData.salaryRange} onChange={handleChange} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none" placeholder="e.g. $100k - $120k" />
                </div>
                
                {isEditing && (
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)]">Job Status</label>
                    <select name="isActive" value={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none">
                      <option value="true">Active (Open for applications)</option>
                      <option value="false">Closed (Hidden from jobs list)</option>
                    </select>
                  </div>
                )}
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)]">Job Description</label>
                  <textarea required name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none" placeholder="Describe the role and responsibilities..."></textarea>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)]">Requirements (One per line)</label>
                  <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows="4" className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none" placeholder="3+ years of React experience&#10;Strong understanding of CSS..."></textarea>
                </div>
              </div>
              
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setShowPostJobModal(false)} className="btn-secondary py-4 px-8 text-[10px] font-black uppercase tracking-widest w-1/3">Cancel</button>
                <button type="submit" className="btn-primary py-4 px-8 text-[10px] font-black uppercase tracking-widest w-2/3 shadow-xl">Post Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
