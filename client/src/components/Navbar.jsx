import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, SignedIn, SignedOut } from '@clerk/clerk-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Force dark styling on html for the whole site whenever the app loads now that we have a dark theme
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.style.backgroundColor = '#000000';
    document.documentElement.style.color = '#ffffff';

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const isScrolled = scrollY > 50;
      setScrolled(isScrolled);
      
      // Calculate progress for smoother shrinking (0 to 1)
      const progress = Math.min(scrollY / 200, 1);
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate dynamic values based on scroll progress
  const logoScale = 1 - scrollProgress * 0.25; // Shrinks from 1 to 0.75
  const padding = 24 - scrollProgress * 8; // Shrinks from 24px to 16px
  const headerHeight = 40 + padding * 0.5; // Dynamic height

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled || !isHomePage 
          ? 'bg-black/95 backdrop-blur-lg border-b border-[#333333]' 
          : 'bg-transparent'
      }`}
      style={{
        padding: `${padding}px 24px`,
        minHeight: `${headerHeight}px`,
      }}
    >
      <div className="w-full mx-auto" style={{ maxWidth: 'min(1200px, 90vw)' }}>
        <div className="flex items-center justify-between" style={{ minHeight: '40px' }}>
          
          {/* Logo */}
          <div className="flex items-center gap-10">
            <Link 
              to="/" 
              className="flex items-center gap-3 transform transition-transform duration-300"
              style={{ transform: `scale(${logoScale})`, transformOrigin: 'left center' }}
            >
              <span 
                className="font-light tracking-wide text-white font-display uppercase hover:opacity-70 transition-opacity duration-300"
                style={{ 
                  fontFamily: "'Jost', sans-serif",
                  fontSize: scrolled ? '18px' : '22px',
                  letterSpacing: scrolled ? '0.08em' : '0.12em',
                  transition: 'all 300ms ease-out'
                }}
              >
                Hire <span style={{ fontWeight: 400, color: '#c8f135' }}>Vision</span>
              </span>
            </Link>
            
            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8 ml-8">
              {[
                { label: 'Jobs', path: '/jobs' },
                { label: 'AI Coach', path: '/prepare-interview' },
                { label: 'Dashboard', path: '/dashboard' }
              ].map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className="text-xs uppercase tracking-widest font-light text-[#a3a3a3] hover:text-white transition-all duration-300 relative group"
                  style={{ 
                    fontFamily: "'Inter', sans-serif",
                    opacity: scrolled ? 0.8 : 1,
                    fontSize: scrolled ? '10px' : '11px',
                  }}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#c8f135] group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-6">
            <SignedOut>
              <div className="flex items-center gap-6">
                <Link 
                  to="/role-selection?action=signin" 
                  className="text-xs uppercase tracking-widest font-light text-[#a3a3a3] hover:text-white transition-colors duration-300"
                  style={{ 
                    fontFamily: "'Inter', sans-serif",
                    fontSize: scrolled ? '9px' : '10px',
                    opacity: scrolled ? 0.8 : 1,
                  }}
                >
                  Sign In
                </Link>
                <Link to="/role-selection?action=signup">
                  <button 
                    className="text-black bg-[#c8f135] rounded-full hover:bg-white hover:shadow-lg transition-all duration-300 font-normal uppercase tracking-widest"
                    style={{ 
                      fontFamily: "'Inter', sans-serif",
                      padding: scrolled ? '6px 16px' : '8px 24px',
                      fontSize: scrolled ? '9px' : '11px',
                      transform: 'translateZ(0)',
                      willChange: 'transform'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05) translateZ(0)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) translateZ(0)'}
                  >
                    Get Started
                  </button>
                </Link>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-3">
                <UserButton 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8 rounded-full border border-[#333333] transition-all duration-300",
                      userButtonTrigger: "focus:shadow-none hover:opacity-80 transition-opacity duration-300"
                    }
                  }} 
                />
              </div>
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Scroll Progress Bar */}
      <div 
        className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-[#c8f135] to-transparent"
        style={{
          width: `${scrollProgress * 100}%`,
          transition: 'width 100ms ease-out',
          opacity: scrolled ? 1 : 0,
        }}
      />
    </nav>
  );
}