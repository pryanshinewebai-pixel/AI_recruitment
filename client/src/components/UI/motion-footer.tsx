"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "../../lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.cinematic-footer-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  --background: #09090b;
  --foreground: #f8fafc;
  --muted-foreground: rgba(248, 250, 252, 0.66);
  --border: rgba(248, 250, 252, 0.12);
  --primary: #c8f135;
  --secondary: #ffffff;
  --destructive: #ef4444;
  --pill-bg-1: color-mix(in oklch, var(--foreground) 8%, transparent);
  --pill-bg-2: color-mix(in oklch, var(--foreground) 3%, transparent);
  --pill-shadow: rgba(0, 0, 0, 0.45);
  --pill-highlight: color-mix(in oklch, var(--foreground) 18%, transparent);
  --pill-inset-shadow: rgba(0, 0, 0, 0.8);
  --pill-border: color-mix(in oklch, var(--foreground) 14%, transparent);
  --pill-bg-1-hover: color-mix(in oklch, var(--primary) 22%, transparent);
  --pill-bg-2-hover: color-mix(in oklch, var(--foreground) 5%, transparent);
  --pill-border-hover: color-mix(in oklch, var(--primary) 55%, transparent);
  --pill-shadow-hover: rgba(200, 241, 53, 0.2);
  --pill-highlight-hover: color-mix(in oklch, var(--primary) 35%, transparent);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.55; }
  100% { transform: translate(-50%, -50%) scale(1.12); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.45)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.8)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

.footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, rgba(248, 250, 252, 0.045) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(248, 250, 252, 0.045) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 72%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 72%, transparent);
}

.footer-aurora {
  background: radial-gradient(circle at 50% 50%, rgba(200, 241, 53, 0.2) 0%, rgba(255, 255, 255, 0.1) 38%, transparent 70%);
}

.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
      0 10px 30px -10px var(--pill-shadow),
      inset 0 1px 1px var(--pill-highlight),
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
      0 20px 40px -10px var(--pill-shadow-hover),
      inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--foreground);
}

.footer-giant-bg-text {
  font-size: clamp(6rem, 20vw, 18rem);
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.07em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(248, 250, 252, 0.08);
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.12) 0%, transparent 65%);
  -webkit-background-clip: text;
  background-clip: text;
}

.footer-text-glow {
  background: linear-gradient(180deg, #ffffff 0%, rgba(200, 241, 53, 0.72) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 24px rgba(200, 241, 53, 0.18));
}
`;

type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return undefined;
      const element = localRef.current;
      if (!element) return undefined;

      const handleMouseMove = (event: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        gsap.to(element, {
          x: x * 0.35,
          y: y * 0.35,
          rotationX: -y * 0.12,
          rotationY: x * 0.12,
          scale: 1.05,
          ease: "power2.out",
          duration: 0.4,
        });
      };

      const handleMouseLeave = () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          ease: "elastic.out(1, 0.3)",
          duration: 1.2,
        });
      };

      element.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        element.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseleave", handleMouseLeave);
      };
    }, []);

    return (
      <Component
        ref={(node: HTMLElement) => {
          localRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>Smarter Shortlists</span> <span className="text-[#c8f135]/70">✦</span>
    <span>Resume Screening</span> <span className="text-white/60">✦</span>
    <span>Interview Flow</span> <span className="text-[#c8f135]/70">✦</span>
    <span>Employer Dashboards</span> <span className="text-white/60">✦</span>
    <span>Candidate Clarity</span> <span className="text-[#c8f135]/70">✦</span>
  </div>
);

export function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (!wrapperRef.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.82, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 85%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 55%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div
        ref={wrapperRef}
        className="relative h-screen w-full"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer className="cinematic-footer-wrapper fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-[#09090b] text-white">
          <div className="footer-aurora pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px]" />
          <div className="footer-bg-grid pointer-events-none absolute inset-0 z-0" />

          <div
            ref={giantTextRef}
            className="footer-giant-bg-text pointer-events-none absolute -bottom-[3vh] left-1/2 z-0 -translate-x-1/2 select-none whitespace-nowrap"
          >
            HIRE VISION
          </div>

          <div className="absolute left-0 top-12 z-10 w-full scale-110 -rotate-2 overflow-hidden border-y border-white/10 bg-black/45 py-4 shadow-2xl backdrop-blur-md">
            <div className="flex w-max animate-footer-scroll-marquee text-xs font-bold uppercase tracking-[0.3em] text-white/65 md:text-sm">
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          <div className="relative z-10 mx-auto mt-20 flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6">
            <h2
              ref={headingRef}
              className="footer-text-glow mb-12 text-center text-5xl font-black tracking-tighter md:text-8xl"
            >
              Ready to hire smarter?
            </h2>

            <div ref={linksRef} className="flex w-full flex-col items-center gap-6">
              <div className="flex w-full flex-wrap justify-center gap-4">
                <MagneticButton
                  as="a"
                  href="/role-selection?action=signup"
                  className="footer-glass-pill group flex items-center gap-3 rounded-full px-10 py-5 text-sm font-bold text-white md:text-base"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c8f135] text-xs text-zinc-950 transition-transform group-hover:rotate-12">
                    HV
                  </span>
                  Start Hiring
                </MagneticButton>

                <MagneticButton
                  as="a"
                  href="/jobs"
                  className="footer-glass-pill group flex items-center gap-3 rounded-full px-10 py-5 text-sm font-bold text-white md:text-base"
                >
                  <svg className="h-6 w-6 text-white/65 transition-colors group-hover:text-[#c8f135]" viewBox="0 0 24 24" fill="none">
                    <path d="M8 7V6a4 4 0 0 1 8 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M5 8h14l-1 11H6L5 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M9 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  Explore Jobs
                </MagneticButton>
              </div>

              <div className="mt-2 flex w-full flex-wrap justify-center gap-3 md:gap-6">
                <MagneticButton as="a" href="/prepare-interview" className="footer-glass-pill rounded-full px-6 py-3 text-xs font-medium text-white/65 hover:text-white md:text-sm">
                  Interview Prep
                </MagneticButton>
                <MagneticButton as="a" href="/upload-resume" className="footer-glass-pill rounded-full px-6 py-3 text-xs font-medium text-white/65 hover:text-white md:text-sm">
                  Upload Resume
                </MagneticButton>
                <MagneticButton as="a" href="/sign-in" className="footer-glass-pill rounded-full px-6 py-3 text-xs font-medium text-white/65 hover:text-white md:text-sm">
                  Sign In
                </MagneticButton>
              </div>
            </div>
          </div>

          <div className="relative z-20 flex w-full flex-col items-center justify-between gap-6 px-6 pb-8 md:flex-row md:px-12">
            <div className="order-2 text-[10px] font-semibold uppercase tracking-widest text-white/55 md:order-1 md:text-xs">
              © 2026 Hire Vision. All rights reserved.
            </div>

            <div className="footer-glass-pill order-1 flex cursor-default items-center gap-2 rounded-full border-white/10 px-6 py-3 md:order-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/55 md:text-xs">Crafted for</span>
              <span className="animate-footer-heartbeat text-sm text-red-500 md:text-base">❤</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/55 md:text-xs">better hiring</span>
            </div>

            <MagneticButton
              as="button"
              onClick={scrollToTop}
              className="footer-glass-pill order-3 flex h-12 w-12 items-center justify-center rounded-full text-white/65 hover:text-white"
            >
              <svg className="h-5 w-5 transform transition-transform duration-300 hover:-translate-y-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </MagneticButton>
          </div>
        </footer>
      </div>
    </>
  );
}
