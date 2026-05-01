import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, UserCircle } from 'lucide-react';

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action') || 'signin';

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  const handleRoleSelection = (role) => {
    localStorage.setItem('intendedRole', role);
    if (action === 'signup') {
      navigate('/sign-up');
    } else {
      navigate('/sign-in');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-32 bg-[var(--color-bg)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 to-transparent pointer-events-none"></div>
      
      <div className="w-full max-w-4xl animate-fade-in-up relative z-10 px-6">
        <div className="text-center mb-12">
          <h1 className="text-[var(--color-heading)] font-display font-black italic tracking-tighter text-4xl md:text-6xl mb-4">
            CHOOSE YOUR PATH
          </h1>
          <p className="text-[var(--color-text-muted)] font-medium text-lg max-w-xl mx-auto opacity-80">
            Select how you want to use Hire Vision. Are you looking for your next great opportunity, or are you hiring top talent?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Candidate Card */}
          <button 
            onClick={() => handleRoleSelection('candidate')}
            className="group relative glass-premium border-white/10 rounded-[2.5rem] p-10 text-left hover:border-[var(--color-accent)]/50 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/0 to-[var(--color-accent)]/5 group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[var(--color-accent)] transition-all duration-300">
                <UserCircle className="w-8 h-8 text-[var(--color-accent)]" />
              </div>
              
              <h2 className="text-3xl font-display font-black text-[var(--color-heading)] mb-4 tracking-tight">FIND A JOB</h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed mb-8 flex-grow">
                Create your profile, practice with our AI interviewer, get your resume parsed instantly, and discover jobs that match your skills perfectly.
              </p>
              
              <div className="text-xs font-black uppercase tracking-widest text-[var(--color-accent)] flex items-center gap-2">
                Continue as Candidate
                <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
              </div>
            </div>
          </button>

          {/* Employer Card */}
          <button 
            onClick={() => handleRoleSelection('employer')}
            className="group relative glass-premium border-white/10 rounded-[2.5rem] p-10 text-left hover:border-[var(--color-accent)]/50 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/0 to-[var(--color-accent)]/5 group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[var(--color-accent)] transition-all duration-300">
                <Briefcase className="w-8 h-8 text-[var(--color-accent)]" />
              </div>
              
              <h2 className="text-3xl font-display font-black text-[var(--color-heading)] mb-4 tracking-tight">POST A JOB</h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed mb-8 flex-grow">
                Post your open roles, reach a pool of pre-vetted top talent, and let our AI match the best candidates directly to your requirements.
              </p>
              
              <div className="text-xs font-black uppercase tracking-widest text-[var(--color-accent)] flex items-center gap-2">
                Continue as Employer
                <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
