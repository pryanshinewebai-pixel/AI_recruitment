import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EmployerDashboard from './EmployerDashboard';
import { 
  LayoutDashboard, 
  Search, 
  Calendar, 
  Briefcase, 
  User, 
  Settings, 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  MoreVertical,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useUser, useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5957';

export default function Dashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [activeView, setActiveView] = useState('Overview'); // Overview, Job Matches, Preparation, Applications
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [applyingJobId, setApplyingJobId] = useState(null);

  // Apply Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [jobToApply, setJobToApply] = useState(null);
  const [applyForm, setApplyForm] = useState({ name: '', email: '', phone: '' });
  const [applyFile, setApplyFile] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyClick = (job) => {
    setJobToApply(job);
    setApplyForm({ ...applyForm, name: user?.fullName || '', email: user?.primaryEmailAddress?.emailAddress || '' });
    setShowApplyModal(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyFile) return alert("Please select a resume file.");
    
    setIsApplying(true);
    try {
      const formData = new FormData();
      formData.append('name', applyForm.name);
      formData.append('email', applyForm.email);
      formData.append('phone', applyForm.phone);
      formData.append('position', jobToApply.title);
      formData.append('resume', applyFile);

      // 1. Upload resume to trigger AI processing
      const resResume = await fetch(`${API_URL}/api/resumes`, {
        method: 'POST',
        body: formData
      });
      const resumeData = await resResume.json();

      let extractedSkills = [];
      let resumeUrl = 'Uploaded via Modal';

      if (resumeData.data) {
        if (resumeData.data.filePath) resumeUrl = resumeData.data.filePath;
        if (resumeData.data.skills) extractedSkills = resumeData.data.skills;
      }

      // 2. Submit formal application linked to job
      const token = await getToken();
      const resApp = await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: jobToApply._id,
          resumeUrl,
          coverLetter: 'Applied directly from Dashboard.',
          extractedSkills
        })
      });

      if (resApp.ok) {
        setAppliedJobs([...appliedJobs, jobToApply._id]);
        setShowApplyModal(false);
        setJobToApply(null);
        setApplyForm({ name: '', email: '', phone: '' });
        setApplyFile(null);
        alert("Application submitted successfully!");
      } else {
        alert("Failed to submit application.");
      }
    } catch (error) {
      console.error(error);
      alert("Error applying for the job.");
    } finally {
      setIsApplying(false);
    }
  };


  useEffect(() => {
    fetch(`${API_URL}/api/jobs`)
      .then(res => res.json())
      .then(data => {
        setAllJobs(data);
        setJobs(data.slice(0, 3)); // Only show top 3 for overview
        setLoadingJobs(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingJobs(false);
      });
  }, []);

  useEffect(() => {
    const checkAndInitRole = async () => {
      try {
        const token = await getToken();
        let currentRole = null;
        let dbRole = null;

        // 1. Fetch profile FIRST to ensure user exists in DB and get their current status
        const res = await fetch(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.isAdmin) {
            navigate('/admin');
            return;
          }
          dbRole = data.role;
        }

        // 2. Check if we have an intended role from RoleSelectionPage
        const intendedRole = localStorage.getItem('intendedRole');
        if (intendedRole) {
          // Send to backend to update the newly created/existing user
          const roleRes = await fetch(`${API_URL}/api/users/role`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ role: intendedRole })
          });
          
          if (roleRes.ok) {
            currentRole = intendedRole;
          }
          localStorage.removeItem('intendedRole'); // clear it
        }

        // 3. Set the final role state
        if (currentRole) {
          setUserRole(currentRole);
        } else if (dbRole) {
          setUserRole(dbRole);
        } else {
          setUserRole('candidate'); // Default
        }

      } catch (err) {
        console.error('Error checking user role:', err);
      }
    };
    checkAndInitRole();
  }, [getToken, navigate]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(`${API_URL}/api/users/profile/sessions`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
           const data = await res.json();
           setActiveSessions(data);
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
      } finally {
        setLoadingSessions(false);
      }
    };
    fetchSessions();
  }, [getToken]);

  return (
    <div className="flex min-h-screen pt-24 bg-[var(--color-bg)]">
      {/* SIDE NAV */}
      <aside className="w-80 hidden lg:flex flex-col p-6 sticky top-24 h-[calc(100vh-6rem)]">
        <div className="glass-premium rounded-[2.5rem] flex flex-col h-full border-[var(--color-border)] shadow-xl overflow-hidden">
          <div className="p-10 space-y-12 flex-grow">
            <div className="space-y-4">
              <p className="px-4 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.3em] mb-6">Navigation</p>
              {userRole === 'employer' ? (
                [
                  { icon: LayoutDashboard, label: "Overview" },
                  { icon: Briefcase, label: "Jobs" },
                  { icon: Calendar, label: "Interviews" },
                  { icon: CheckCircle2, label: "Candidates" },
                ].map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveView(item.label)}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group
                      ${activeView === item.label 
                        ? 'bg-[var(--color-accent)] text-white shadow-lg shadow-blue-500/20' 
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-heading)]'}`}
                  >
                    <item.icon className={`w-5 h-5 shrink-0 ${activeView === item.label ? 'animate-pulse' : 'opacity-60 group-hover:opacity-100'}`} />
                    <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                  </button>
                ))
              ) : (
                [
                  { icon: LayoutDashboard, label: "Overview" },
                  { icon: Briefcase, label: "Jobs" },
                  { icon: Calendar, label: "Preparation" },
                  { icon: CheckCircle2, label: "Applications" },
                ].map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveView(item.label)}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group
                      ${activeView === item.label 
                        ? 'bg-[var(--color-accent)] text-white shadow-lg shadow-blue-500/20' 
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-heading)]'}`}
                  >
                    <item.icon className={`w-5 h-5 shrink-0 ${activeView === item.label ? 'animate-pulse' : 'opacity-60 group-hover:opacity-100'}`} />
                    <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                  </button>
                ))
              )}
            </div>

            <div className="pt-10 border-t border-[var(--color-border)] space-y-4">
              <p className="px-4 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.3em] mb-6">Discovery</p>
              {[
                { icon: User, label: "Profile" },
                { icon: Settings, label: "Settings" },
              ].map((item, i) => (
                <button 
                  key={i} 
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-heading)] transition-all duration-300 group"
                >
                  <item.icon className="w-5 h-5 shrink-0 opacity-60 group-hover:opacity-100" />
                  <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            <div className="bg-gradient-to-br from-[var(--color-accent)]/20 to-purple-600/20 rounded-3xl p-6 border border-[var(--color-accent)]/20 relative overflow-hidden group cursor-pointer shadow-inner">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--color-accent)] opacity-10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <p className="text-xs font-black text-[var(--color-heading)] mb-2 uppercase tracking-widest">{userRole === 'employer' ? 'Enterprise Plan' : 'Elite Plan'}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] font-bold mb-5 leading-relaxed">{userRole === 'employer' ? 'Unlimited job postings and AI matching.' : 'Unlimited AI Coaching sessions unlocked for your success.'}</p>
              <button className="w-full py-3 bg-[var(--color-heading)] text-[var(--color-bg)] rounded-xl text-[10px] font-black tracking-[0.2em] uppercase hover:scale-105 transition-all">Manage Plan</button>
            </div>
          </div>
        </div>
      </aside>

      {/* JOB DETAILS MODAL */}
      {selectedJob && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-[var(--color-bg)] rounded-[2rem] border border-[var(--color-border)] shadow-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-8">
               <button onClick={() => setSelectedJob(null)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)] transition-transform hover:scale-110">✕</button>
               
               <div className="space-y-8">
                  <div className="flex gap-6 items-start border-b border-[var(--color-border)] pb-8">
                     <div className="w-20 h-20 bg-[var(--color-surface-2)] rounded-3xl border border-[var(--color-border)] flex items-center justify-center pt-2 shadow-sm shrink-0">
                        <span className="text-4xl font-black text-[var(--color-accent)] italic opacity-30">{selectedJob.company?.[0] || 'C'}</span>
                     </div>
                     <div className="space-y-2 mt-2">
                        <h2 className="text-3xl font-display font-black text-[var(--color-heading)] tracking-tighter leading-none">{selectedJob.title}</h2>
                        <div className="flex flex-wrap items-center gap-3">
                           <p className="text-lg font-black text-[var(--color-accent)] italic opacity-90">{selectedJob.company}</p>
                           {selectedJob.companyWebsite && (
                              <a href={selectedJob.companyWebsite.startsWith('http') ? selectedJob.companyWebsite : `https://${selectedJob.companyWebsite}`} target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-accent)] underline underline-offset-4 decoration-[var(--color-border)] hover:decoration-[var(--color-accent)] transition-all">Visit Website</a>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                     {[
                        { label: 'Location', val: selectedJob.location },
                        { label: 'Type', val: selectedJob.type },
                        { label: 'Experience', val: selectedJob.experienceLevel },
                        { label: 'Salary', val: selectedJob.salaryRange }
                     ].map((badge, idx) => badge.val ? (
                        <div key={idx} className="px-4 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl">
                           <p className="text-[9px] uppercase font-black text-[var(--color-text-muted)] tracking-widest mb-1">{badge.label}</p>
                           <p className="text-xs font-bold text-[var(--color-heading)]">{badge.val}</p>
                        </div>
                     ) : null)}
                  </div>

                  <div className="space-y-3">
                     <h3 className="text-xs font-black uppercase text-[var(--color-heading)] tracking-widest border-b border-[var(--color-border)] pb-2 inline-block">Role Description</h3>
                     <p className="text-sm font-medium text-[var(--color-text)] leading-relaxed">{selectedJob.description}</p>
                  </div>

                  {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                     <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase text-[var(--color-heading)] tracking-widest border-b border-[var(--color-border)] pb-2 inline-block">Key Requirements</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                           {selectedJob.requirements.map((req, i) => (
                              <li key={i} className="flex gap-3 text-sm text-[var(--color-text)] font-medium">
                                 <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] shrink-0 mt-0.5" />
                                 {req}
                              </li>
                           ))}
                        </ul>
                     </div>
                  )}

                  <div className="pt-6">
                     <button onClick={() => setSelectedJob(null)} className="w-full btn-primary py-4 text-xs font-black tracking-[0.2em] uppercase shadow-xl hover:-translate-y-1">Close Details View</button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-grow p-10 space-y-12 overflow-y-auto">
        {userRole === 'employer' ? (
          <EmployerDashboard activeView={activeView} setActiveView={setActiveView} />
        ) : (
          <>
            {/* PAGE HEADER */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-[var(--color-heading)] tracking-tight leading-tight">
              {activeView === 'Overview' ? `Welcome back, ${user?.firstName || 'Hero'} 👋` : activeView}
            </h1>
            <p className="text-base text-[var(--color-text-muted)] font-medium italic opacity-80">
              {activeView === 'Overview' ? 'Your AI career intelligence is synchronized and ready.' : `Real-time analytics for your ${activeView.toLowerCase()}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 w-full xl:w-auto">
            <button className="btn-secondary py-3 px-8 flex items-center gap-3 text-xs font-black uppercase tracking-widest bg-[var(--color-surface-2)] border-[var(--color-border)]">
              <Filter className="w-4 h-4" /> Global Filters
            </button>
            <Link to="/upload-resume" className="btn-primary py-3 px-8 flex items-center gap-3 text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 pr-10">
              <Plus className="w-4 h-4" /> Upload Resume
            </Link>
          </div>
        </header>

        {activeView === 'Overview' && (
          <div className="animate-fade-in space-y-12">
            {/* METRIC STRIP */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: "AI Matches", value: "12", trend: "+3 new roles", color: "text-[var(--color-accent)]" },
                { label: "Active Pipeline", value: "45", trend: "8 pending review", color: "text-blue-500" },
                { label: "Interview Health", value: "85%", trend: "Elite Performance", color: "text-purple-500" },
                { label: "Success Rate", value: "3", trend: "Final discussions", color: "text-[var(--color-success)]" },
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

            {/* CONTENT GRID */}
            <div className="grid xl:grid-cols-3 gap-12">
              {/* PRIMARY: JOB MATCHES */}
              <div className="xl:col-span-2 space-y-10">
                <div className="flex items-center justify-between px-4">
                   <div className="flex items-center gap-4">
                      <div className="w-2 h-8 bg-[var(--color-accent)] rounded-full"></div>
                      <h2 className="text-2xl font-display font-black text-[var(--color-heading)] tracking-tight italic">Curated AI Pipeline</h2>
                   </div>
                  <button onClick={() => setActiveView('Jobs')} className="text-[var(--color-accent)] text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform">Explore All</button>
                </div>
                
                <div className="space-y-6">
                  {loadingJobs ? (
                    <div className="py-20 flex flex-col items-center">
                       <div className="w-10 h-10 rounded-full border-4 border-[var(--color-accent)]/20 border-t-[var(--color-accent)] animate-spin"></div>
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="py-16 card-premium glass-premium text-center border-dashed border-2">
                       <p className="text-[var(--color-text-muted)] font-bold italic opacity-60">No new high-priority matches found today.</p>
                    </div>
                  ) : jobs.map((job, i) => (
                    <div key={job._id || i} className="card-premium flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group relative overflow-hidden">
                      <div className="flex gap-8 flex-grow">
                        <div className="w-16 h-16 bg-[var(--color-surface-2)] rounded-3xl border border-[var(--color-border)] flex items-center justify-center shrink-0 group-hover:border-[var(--color-accent)]/30 group-hover:bg-[var(--color-surface)] transition-all duration-500 shadow-sm">
                          <span className="text-2xl font-black text-[var(--color-accent)] italic opacity-30">{job.company?.[0] || 'C'}</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-4">
                            <h3 className="text-xl font-display font-bold text-[var(--color-heading)] group-hover:text-[var(--color-accent)] transition-colors tracking-tight">{job.title}</h3>
                            <div className="px-3 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[9px] font-black border border-[var(--color-accent)]/10 uppercase tracking-widest">
                               {Math.floor(Math.random() * 10 + 90)}% Synchronization
                            </div>
                          </div>
                          <p className="text-sm font-black text-[var(--color-text-muted)] italic opacity-80">{job.company} &bull; <span className="text-[var(--color-heading)] opacity-100">{job.salaryRange || 'Competitive'}</span></p>
                          <div className="flex gap-3 pt-1">
                             {job.location && <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-[var(--color-surface-2)] rounded-lg text-[var(--color-text-muted)] opacity-60 border border-[var(--color-border)]">{job.location}</span>}
                             {job.type && <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-[var(--color-surface-2)] rounded-lg text-[var(--color-text-muted)] opacity-60 border border-[var(--color-border)]">{job.type}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <button onClick={() => setSelectedJob(job)} className="btn-secondary py-3 px-6 text-[10px] font-black tracking-widest uppercase flex-1 shadow-md">Details</button>
                        <button 
                          onClick={() => handleApplyClick(job)} 
                          disabled={appliedJobs.includes(job._id)}
                          className={`py-3 px-6 text-[10px] font-black tracking-widest uppercase flex-1 shadow-md transition-transform ${
                            appliedJobs.includes(job._id) ? 'bg-green-600/20 text-green-400 border border-green-500/30 cursor-default' : 'btn-primary shadow-blue-500/20 hover:-translate-y-1'
                          }`}
                        >
                          {appliedJobs.includes(job._id) ? 'Applied ✓' : 'Apply'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECONDARY: UPCOMING & RECENT */}
              <div className="space-y-12">
                <div className="space-y-8">
                  <h2 className="text-xl font-display font-bold text-[var(--color-heading)] px-2 tracking-tight">Active Sessions</h2>
                  <div className="card-premium space-y-4 bg-gradient-to-br from-[var(--color-surface-2)] to-transparent p-6 min-h-[120px]">
                    {loadingSessions ? (
                       <div className="flex justify-center items-center h-full pt-4">
                          <div className="w-6 h-6 rounded-full border-2 border-[var(--color-accent)]/20 border-t-[var(--color-accent)] animate-spin"></div>
                       </div>
                    ) : activeSessions.length === 0 ? (
                       <p className="text-sm font-bold text-[var(--color-text-muted)] italic opacity-80 text-center py-4">No active sessions scheduled.</p>
                    ) : activeSessions.map((s, i) => (
                      <div key={i} className="p-4 rounded-[1.5rem] bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] flex items-center justify-between group hover:border-[var(--color-accent)]/30 cursor-pointer transition-all duration-300">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${s.active ? 'bg-green-500 animate-pulse' : 'bg-[var(--color-accent)]'}`}></div>
                            <span className="text-[10px] text-[var(--color-text-muted)] font-black uppercase tracking-widest">{s.time}</span>
                          </div>
                          <p className="text-sm font-black text-[var(--color-heading)] uppercase tracking-tighter italic">{s.title}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center group-hover:scale-110 transition-transform">
                           <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <h2 className="text-xl font-display font-bold text-[var(--color-heading)] px-2 tracking-tight">Intelligence Feed</h2>
                  <div className="space-y-8 px-2">
                    {[
                      { text: "Application synchronized with NVIDIA", time: "2h ago", status: "viewed" },
                      { text: "AI Resume optimization matrix complete", time: "5h ago", status: "done" },
                      { text: "Interview synchronization with Microsoft", time: "Yesterday", status: "urgent" },
                    ].map((a, i) => (
                      <div key={i} className="flex gap-6 relative group">
                        {i !== 2 && <div className="absolute left-[7px] top-6 bottom-[-32px] w-[2px] bg-[var(--color-border)] group-hover:bg-[var(--color-accent)]/20 transition-colors"></div>}
                        <div className={`w-4 h-4 rounded-full border-[3px] border-[var(--color-bg)] shadow-md shrink-0 z-10 transition-transform duration-500 group-hover:scale-150
                          ${a.status === 'urgent' ? 'bg-orange-500' : 'bg-[var(--color-accent)]'}`}></div>
                        <div className="space-y-1 pt-0.5">
                          <p className="text-xs font-bold text-[var(--color-text)] leading-relaxed group-hover:text-[var(--color-heading)] transition-colors">{a.text}</p>
                          <p className="text-[10px] font-black text-[var(--color-text-muted)] italic opacity-60 uppercase tracking-widest">{a.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'Jobs' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="card-premium glass-premium p-6 flex flex-col md:flex-row gap-6 items-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)]/5 to-transparent pointer-events-none"></div>
                <div className="flex-grow relative w-full">
                   <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                   <input 
                     type="text" 
                     placeholder="Search specialized roles or companies..." 
                     className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl py-4 pl-14 pr-6 text-sm font-semibold text-[var(--color-heading)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all placeholder:italic"
                   />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                   <button className="btn-secondary py-4 px-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap bg-[var(--color-surface-2)]">Priority Ranking</button>
                   <button className="btn-primary py-4 px-10 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 whitespace-nowrap">Find Now</button>
                </div>
             </div>

             <div className="grid md:grid-cols-2 gap-10">
                {allJobs.length === 0 ? <p className="text-[var(--color-text-muted)] italic text-center py-20 col-span-2">Initializing career discovery matrix...</p> : allJobs.map((job) => (
                   <div key={job._id} className="card-premium group hover:shadow-2xl transition-all duration-700 flex flex-col justify-between border-[var(--color-border)] hover:border-[var(--color-accent)]/20 p-8">
                      <div className="space-y-6">
                         <div className="flex justify-between items-start">
                            <div className="w-14 h-14 bg-[var(--color-surface-2)] rounded-3xl border border-[var(--color-border)] flex items-center justify-center group-hover:bg-[var(--color-surface)] group-hover:scale-110 transition-all duration-500 shadow-sm relative pt-1 ring-1 ring-black/[0.02]">
                               <span className="text-2xl font-black text-[var(--color-accent)] italic opacity-30">{job.company?.[0] || 'C'}</span>
                            </div>
                            <div className="px-3 py-1.5 rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[9px] font-black border border-[var(--color-accent)]/20 uppercase tracking-[0.2em] shadow-sm">
                               {Math.floor(Math.random() * 20 + 80)}% Fit
                            </div>
                         </div>
                         <div>
                            <h3 className="text-2xl font-display font-black text-[var(--color-heading)] group-hover:text-[var(--color-accent)] transition-colors tracking-tighter leading-tight mb-1">{job.title}</h3>
                            <p className="text-sm font-black text-[var(--color-accent)] italic tracking-tight opacity-90">{job.company}</p>
                         </div>
                         <p className="text-xs font-medium text-[var(--color-text-muted)] line-clamp-3 leading-relaxed opacity-80">{job.description}</p>
                         <div className="flex flex-wrap gap-3">
                            {job.location && <span className="px-3 py-1 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest opacity-70">{job.location}</span>}
                            {job.type && <span className="px-3 py-1 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest opacity-70">{job.type}</span>}
                            {job.salaryRange && <span className="px-3 py-1 bg-[var(--color-accent)]/10 rounded-lg border border-[var(--color-accent)]/10 text-[9px] font-black text-[var(--color-accent)] uppercase tracking-widest">{job.salaryRange}</span>}
                         </div>
                      </div>
                      <div className="pt-8 mt-8 border-t border-[var(--color-border)] flex gap-4">
                         <button onClick={() => setSelectedJob(job)} className="btn-secondary py-3 flex-1 text-[10px] font-black uppercase tracking-[0.2em] bg-[var(--color-surface-2)] border-[var(--color-border)] hover:bg-[var(--color-border)] transition-all">Details</button>
                         <button 
                          onClick={() => handleApplyClick(job)} 
                          disabled={appliedJobs.includes(job._id)}
                          className={`py-3 flex-1 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                            appliedJobs.includes(job._id) ? 'bg-green-600/20 text-green-400 border border-green-500/30 cursor-default rounded-xl' : 'btn-primary shadow-lg shadow-blue-500/20 hover:-translate-y-1'
                          }`}
                        >
                          {appliedJobs.includes(job._id) ? 'Applied ✓' : 'Apply'}
                        </button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {(activeView === 'Preparation' || activeView === 'Applications') && (
          <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-in zoom-in duration-500">
             <div className="w-24 h-24 bg-[var(--color-accent)]/10 rounded-[2.5rem] flex items-center justify-center border border-[var(--color-accent)]/20 shadow-inner group">
                <LayoutDashboard className="w-10 h-10 text-[var(--color-accent)] opacity-40 group-hover:opacity-100 transition-opacity animate-pulse" />
             </div>
             <div className="text-center space-y-3">
                <h3 className="text-2xl font-display font-black text-[var(--color-heading)] tracking-tighter italic">{activeView} Optimization</h3>
                <p className="text-sm font-medium text-[var(--color-text-muted)] italic max-w-sm mx-auto opacity-70">Our AI is currently prioritizing your profile matrix. This module will be synchronized shortly.</p>
             </div>
             <button onClick={() => setActiveView('Overview')} className="btn-secondary py-3 px-10 text-[10px] font-black uppercase tracking-widest bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-[var(--color-accent)]/30 transition-all">Synchronize Dashboard</button>
        </div>
      )}
          </>
        )}
      </main>

      {/* APPLY MODAL */}
      {showApplyModal && jobToApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[var(--color-bg)] rounded-[2rem] border border-[var(--color-border)] shadow-2xl p-8">
            <button onClick={() => setShowApplyModal(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)] transition-transform hover:scale-110">✕</button>
            
            <h2 className="text-2xl font-display font-black text-[var(--color-heading)] tracking-tight mb-2">Apply for {jobToApply.title}</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">Please provide your details and resume to complete your application for {jobToApply.company}.</p>
            
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)]">Full Name</label>
                <input required type="text" value={applyForm.name} onChange={(e) => setApplyForm({...applyForm, name: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)]">Email Address</label>
                <input required type="email" value={applyForm.email} onChange={(e) => setApplyForm({...applyForm, email: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)]">Phone Number</label>
                <input required type="tel" value={applyForm.phone} onChange={(e) => setApplyForm({...applyForm, phone: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none" placeholder="+1 234 567 8900" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)]">Resume File (PDF/DOCX)</label>
                <input required type="file" accept=".pdf,.doc,.docx" onChange={(e) => setApplyFile(e.target.files[0])} className="w-full text-sm text-[var(--color-text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-[var(--color-surface-2)] file:text-[var(--color-heading)] hover:file:bg-[var(--color-border)] cursor-pointer" />
              </div>
              
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setShowApplyModal(false)} className="btn-secondary py-4 px-8 text-[10px] font-black uppercase tracking-widest w-1/3">Cancel</button>
                <button type="submit" disabled={isApplying} className="btn-primary py-4 px-8 text-[10px] font-black uppercase tracking-widest w-2/3 shadow-xl disabled:opacity-50">
                  {isApplying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}