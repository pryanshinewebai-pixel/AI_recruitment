import { useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  FileText,
  GraduationCap,
  HeartPulse,
  Mail,
  MapPin,
  MessageCircle,
  Quote,
  SearchCheck,
  Send,
  Sparkles,
  Star,
  UserCheck,
} from 'lucide-react';
import * as THREE from 'three';
import RadialOrbitalTimeline from '../components/ui/radial-orbital-timeline';
import { CinematicFooter } from '../components/ui/motion-footer';

gsap.registerPlugin(ScrollTrigger);

const benefits = [
  'Upload resumes',
  'Review candidates',
  'Schedule interviews',
];

const industries = [
  {
    title: 'Technology',
    copy: 'Hire engineers, designers, analysts, and product teams with structured shortlists.',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Healthcare',
    copy: 'Organize applications for clinical, operations, and patient-support roles.',
    icon: HeartPulse,
  },
  {
    title: 'Corporate',
    copy: 'Support hiring across HR, finance, sales, operations, and administration.',
    icon: Building2,
  },
  {
    title: 'Education',
    copy: 'Review teachers, trainers, coordinators, and campus staff in one workflow.',
    icon: GraduationCap,
  },
];

const testimonials = [
  {
    quote:
      'Hire Vision helped us cut through application noise and focus on candidates who were actually ready for the role.',
    name: 'Anika Sharma',
    role: 'Talent Lead, NovaGrid',
    metric: '42%',
    metricLabel: 'faster screening',
  },
  {
    quote:
      'The hiring board made our review meetings sharper. Everyone could see the same shortlist, notes, and next steps.',
    name: 'Marcus Lee',
    role: 'People Ops Manager, BrightPath',
    metric: '3.1x',
    metricLabel: 'more aligned reviews',
  },
  {
    quote:
      'We moved from spreadsheets to a workflow that feels calm, visual, and reliable for both recruiters and hiring managers.',
    name: 'Priya Nair',
    role: 'HR Director, CareBridge',
    metric: '18h',
    metricLabel: 'saved each week',
  },
  {
    quote:
      'Candidates stopped getting lost between stages. The whole process finally felt intentional from upload to interview.',
    name: 'Owen Miller',
    role: 'Recruiting Partner, CloudNest',
    metric: '91%',
    metricLabel: 'pipeline visibility',
  },
];

const contactDetails = [
  {
    label: 'Email',
    value: 'hello@hirevision.com',
    copy: 'For platform questions and hiring workflow help.',
    icon: Mail,
  },
  {
    label: 'Response',
    value: 'Within 24 hours',
    copy: 'Tell us about your hiring goals and we will follow up.',
    icon: MessageCircle,
  },
  {
    label: 'Location',
    value: 'Remote-first team',
    copy: 'Supporting recruiters, employers, and candidates anywhere.',
    icon: MapPin,
  },
];

const recruitmentTimeline = [
  {
    id: 1,
    title: 'Source',
    date: '01',
    content: 'Collect qualified candidates from job posts and resume uploads.',
    category: 'Pipeline',
    icon: SearchCheck,
    relatedIds: [2],
    status: 'completed',
    energy: 94,
  },
  {
    id: 2,
    title: 'Screen',
    date: '02',
    content: 'Compare resumes, role fit, and candidate details in one view.',
    category: 'Review',
    icon: ClipboardCheck,
    relatedIds: [1, 3],
    status: 'completed',
    energy: 86,
  },
  {
    id: 3,
    title: 'Shortlist',
    date: '03',
    content: 'Move the strongest candidates forward with a cleaner review flow.',
    category: 'Decision',
    icon: UserCheck,
    relatedIds: [2, 4],
    status: 'in-progress',
    energy: 72,
  },
  {
    id: 4,
    title: 'Interview',
    date: '04',
    content: 'Coordinate interviews and keep next steps visible to the team.',
    category: 'Schedule',
    icon: CalendarCheck,
    relatedIds: [3],
    status: 'pending',
    energy: 48,
  },
];

export default function ModernLandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const heroRef = useRef(null);
  const heroVideoRef = useRef(null);
  const heroContentRef = useRef(null);
  const aboutRef = useRef(null);
  const industriesRef = useRef(null);
  const industriesCanvasRef = useRef(null);
  const testimonialsRef = useRef(null);
  const testimonialsCanvasRef = useRef(null);
  const testimonialsTrackRef = useRef(null);
  const contactRef = useRef(null);
  const contactCanvasRef = useRef(null);

  useEffect(() => {
    if (!aboutRef.current) return undefined;

    const heroCtx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: '+=100%',
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        })
        .fromTo(
          heroVideoRef.current,
          { yPercent: -8, scale: 1 },
          { yPercent: 12, scale: 1.18, ease: 'none' },
          0
        )
        .fromTo(
          heroContentRef.current,
          { y: 0, opacity: 1 },
          { y: -180, opacity: 0.18, ease: 'none' },
          0
        );
    }, heroRef);

    const ctx = gsap.context(() => {
      gsap.from('.about-reveal', {
        opacity: 0,
        y: 36,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.14,
        scrollTrigger: {
          trigger: aboutRef.current,
          start: 'top 72%',
        },
      });

      gsap.from('.recruitment-step', {
        opacity: 0,
        x: 36,
        duration: 0.75,
        ease: 'power3.out',
        stagger: 0.16,
        scrollTrigger: {
          trigger: '.recruitment-panel',
          start: 'top 76%',
        },
      });

      gsap.to('.recruitment-panel', {
        y: -14,
        duration: 2.6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      gsap.to('.status-dot', {
        scale: 1.25,
        opacity: 0.45,
        duration: 1.1,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.2,
      });
    }, aboutRef);

    return () => {
      heroCtx.revert();
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (!industriesRef.current || !industriesCanvasRef.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.from('.industry-reveal', {
        opacity: 0,
        y: 42,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: industriesRef.current,
          start: 'top 72%',
        },
      });

      gsap.from('.industry-eyebrow', {
        opacity: 0,
        y: 18,
        letterSpacing: '0.5em',
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: industriesRef.current,
          start: 'top 70%',
        },
      });

      gsap.from('.industry-title-line', {
        opacity: 0,
        yPercent: 110,
        rotateX: -18,
        duration: 1,
        ease: 'power4.out',
        stagger: 0.14,
        scrollTrigger: {
          trigger: industriesRef.current,
          start: 'top 66%',
        },
      });

      gsap.from('.industry-copy', {
        opacity: 0,
        y: 24,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: industriesRef.current,
          start: 'top 58%',
        },
      });

      gsap.to('.industry-card', {
        y: -8,
        duration: 2.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.18,
      });
    }, industriesRef);

    const canvas = industriesCanvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const geometry = new THREE.BufferGeometry();
    const count = 90;
    const positions = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 9;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xc8f135,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const resize = () => {
      const { clientWidth, clientHeight } = canvas.parentElement;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener('resize', resize);

    let frameId;
    const animate = () => {
      points.rotation.y += 0.0018;
      points.rotation.x += 0.0008;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      ctx.revert();
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(frameId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (
      !testimonialsRef.current ||
      !testimonialsCanvasRef.current ||
      !testimonialsTrackRef.current
    ) {
      return undefined;
    }

    const hoverCleanups = [];
    const ctx = gsap.context(() => {
      gsap.from('.testimonial-kicker', {
        opacity: 0,
        y: 18,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: testimonialsRef.current,
          start: 'top 72%',
        },
      });

      gsap.from('.testimonial-heading span', {
        opacity: 0,
        yPercent: 110,
        rotateX: -18,
        duration: 1,
        ease: 'power4.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: testimonialsRef.current,
          start: 'top 68%',
        },
      });

      gsap.from('.testimonial-card', {
        opacity: 0,
        y: 56,
        rotate: -2,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.13,
        scrollTrigger: {
          trigger: testimonialsRef.current,
          start: 'top 58%',
        },
      });

      gsap.set('.testimonial-card', {
        transformPerspective: 900,
        transformOrigin: 'center center',
      });

      gsap.utils.toArray('.testimonial-card').forEach((card) => {
        const quoteBadge = card.querySelector('.testimonial-quote-badge');
        const stars = card.querySelectorAll('.testimonial-star');
        const glow = card.querySelector('.testimonial-glow');

        const handleMove = (event) => {
          const bounds = card.getBoundingClientRect();
          const x = event.clientX - bounds.left;
          const y = event.clientY - bounds.top;
          const rotateY = ((x / bounds.width) - 0.5) * 10;
          const rotateX = ((0.5 - y / bounds.height)) * 8;

          gsap.to(card, {
            rotateX,
            rotateY,
            y: -12,
            scale: 1.025,
            duration: 0.45,
            ease: 'power3.out',
          });

          gsap.to(glow, {
            x: x - bounds.width / 2,
            y: y - bounds.height / 2,
            opacity: 0.85,
            duration: 0.35,
            ease: 'power3.out',
          });
        };

        const handleEnter = () => {
          gsap.to(card, {
            borderColor: 'rgba(200, 241, 53, 0.9)',
            boxShadow: '0 34px 90px rgba(9, 9, 11, 0.2)',
            duration: 0.35,
            ease: 'power3.out',
          });
          gsap.to(quoteBadge, {
            rotate: -8,
            scale: 1.12,
            backgroundColor: '#c8f135',
            color: '#09090b',
            duration: 0.4,
            ease: 'back.out(1.8)',
          });
          gsap.fromTo(
            stars,
            { y: 0, rotate: 0 },
            {
              y: -5,
              rotate: 12,
              duration: 0.35,
              ease: 'back.out(2)',
              stagger: 0.04,
              yoyo: true,
              repeat: 1,
            }
          );
        };

        const handleLeave = () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            y: 0,
            scale: 1,
            borderColor: 'rgba(9, 9, 11, 0.15)',
            boxShadow: '0 25px 50px rgba(9, 9, 11, 0.1)',
            duration: 0.55,
            ease: 'elastic.out(1, 0.55)',
          });
          gsap.to(glow, {
            opacity: 0,
            x: 0,
            y: 0,
            duration: 0.35,
            ease: 'power2.out',
          });
          gsap.to(quoteBadge, {
            rotate: 0,
            scale: 1,
            backgroundColor: '#09090b',
            color: '#ffffff',
            duration: 0.35,
            ease: 'power3.out',
          });
        };

        card.addEventListener('mousemove', handleMove);
        card.addEventListener('mouseenter', handleEnter);
        card.addEventListener('mouseleave', handleLeave);

        hoverCleanups.push(() => {
          card.removeEventListener('mousemove', handleMove);
          card.removeEventListener('mouseenter', handleEnter);
          card.removeEventListener('mouseleave', handleLeave);
        });
      });

      gsap.to('.testimonial-orbit', {
        rotate: 360,
        duration: 26,
        ease: 'none',
        repeat: -1,
      });

      gsap.to('.testimonial-progress', {
        scaleX: 1,
        transformOrigin: 'left center',
        ease: 'none',
        scrollTrigger: {
          trigger: testimonialsRef.current,
          start: 'top 78%',
          end: 'bottom 35%',
          scrub: 1,
        },
      });
    }, testimonialsRef);

    const canvas = testimonialsCanvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const group = new THREE.Group();
    scene.add(group);
    const pointer = new THREE.Vector2(0, 0);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xc8f135,
      transparent: true,
      opacity: 0.18,
      wireframe: true,
    });
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.48,
      wireframe: true,
    });

    const ringGeometry = new THREE.TorusGeometry(1.8, 0.008, 12, 96);
    const sphereGeometry = new THREE.IcosahedronGeometry(0.42, 1);

    for (let index = 0; index < 4; index += 1) {
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = index * 0.72;
      ring.rotation.y = index * 0.44;
      ring.scale.setScalar(1 + index * 0.18);
      group.add(ring);
    }

    const nodes = [];
    for (let index = 0; index < testimonials.length; index += 1) {
      const node = new THREE.Mesh(sphereGeometry, sphereMaterial);
      const angle = (index / testimonials.length) * Math.PI * 2;
      node.position.set(Math.cos(angle) * 2.85, Math.sin(angle) * 1.55, Math.sin(angle) * 0.8);
      nodes.push(node);
      group.add(node);
    }

    const resize = () => {
      const { clientWidth, clientHeight } = canvas.parentElement;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener('resize', resize);

    const handlePointerMove = (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -2;
    };

    testimonialsRef.current.addEventListener('pointermove', handlePointerMove);

    let frameId;
    const animate = () => {
      group.rotation.y += 0.0022;
      group.rotation.x = Math.sin(Date.now() * 0.0003) * 0.12 + pointer.y * 0.08;
      group.position.x += (pointer.x * 0.35 - group.position.x) * 0.04;
      group.position.y += (pointer.y * 0.22 - group.position.y) * 0.04;
      nodes.forEach((node, index) => {
        node.rotation.x += 0.006 + index * 0.001;
        node.rotation.y += 0.004;
        node.scale.setScalar(1 + Math.sin(Date.now() * 0.002 + index) * 0.08);
      });
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      hoverCleanups.forEach((cleanup) => cleanup());
      ctx.revert();
      window.removeEventListener('resize', resize);
      testimonialsRef.current?.removeEventListener('pointermove', handlePointerMove);
      window.cancelAnimationFrame(frameId);
      ringGeometry.dispose();
      sphereGeometry.dispose();
      ringMaterial.dispose();
      sphereMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!contactRef.current || !contactCanvasRef.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.from('.contact-kicker', {
        opacity: 0,
        y: 18,
        letterSpacing: '0.45em',
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: contactRef.current,
          start: 'top 76%',
        },
      });

      gsap.from('.contact-title-line', {
        opacity: 0,
        yPercent: 110,
        rotateX: -18,
        duration: 1,
        ease: 'power4.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: contactRef.current,
          start: 'top 70%',
        },
      });

      gsap.from('.contact-reveal', {
        opacity: 0,
        y: 42,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: contactRef.current,
          start: 'top 62%',
        },
      });

      gsap.to('.contact-float', {
        y: -10,
        duration: 2.8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.2,
      });

      gsap.to('.contact-signal', {
        scale: 1.35,
        opacity: 0.25,
        duration: 1.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.18,
      });
    }, contactRef);

    const canvas = contactCanvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const group = new THREE.Group();
    scene.add(group);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xc8f135,
      transparent: true,
      opacity: 0.34,
    });
    const dotMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.055,
      transparent: true,
      opacity: 0.72,
    });

    const curvePoints = [];
    for (let index = 0; index < 110; index += 1) {
      const progress = index / 109;
      curvePoints.push(
        new THREE.Vector3(
          (progress - 0.5) * 8,
          Math.sin(progress * Math.PI * 4) * 0.65,
          Math.cos(progress * Math.PI * 2) * 1.2
        )
      );
    }

    const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    for (let index = 0; index < 5; index += 1) {
      const line = new THREE.Line(curveGeometry, lineMaterial);
      line.rotation.z = index * 0.34;
      line.rotation.y = index * 0.22;
      line.position.y = (index - 2) * 0.48;
      group.add(line);
    }

    const dotGeometry = new THREE.BufferGeometry();
    const dotCount = 80;
    const positions = new Float32Array(dotCount * 3);
    for (let index = 0; index < dotCount; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 8;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    dotGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dots = new THREE.Points(dotGeometry, dotMaterial);
    group.add(dots);

    const resize = () => {
      const { clientWidth, clientHeight } = canvas.parentElement;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener('resize', resize);

    let frameId;
    const animate = () => {
      group.rotation.y += 0.0018;
      group.rotation.x = Math.sin(Date.now() * 0.00035) * 0.08;
      dots.rotation.z += 0.001;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      ctx.revert();
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(frameId);
      curveGeometry.dispose();
      dotGeometry.dispose();
      lineMaterial.dispose();
      dotMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <section
        ref={heroRef}
        className="relative flex min-h-screen w-full items-center overflow-hidden px-6 sm:px-10"
        style={{ marginTop: 0, paddingTop: 0 }}
      >
        <video
          ref={heroVideoRef}
          className="absolute inset-x-0 top-[-10%] h-[120%] w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/7581157-hd_1920_1080_30fps.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/45" />

        <div
          ref={heroContentRef}
          className="relative z-10 mx-auto w-full max-w-7xl text-center"
        >
          <p className="mb-8 text-xl font-semibold text-white sm:text-2xl">
            Hire Vision
          </p>

          <h1
            className="mx-auto max-w-6xl text-6xl font-normal uppercase leading-[0.95] text-white sm:text-8xl lg:text-[8.5rem]"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Hiring Made Simple
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/85">
            Manage job applications, screen resumes, and move candidates through
            interviews from one clean dashboard.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/role-selection?action=signup"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Get started
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center rounded-full border border-white/70 px-8 py-4 text-base font-semibold text-white transition hover:bg-white hover:text-zinc-950"
            >
              View jobs
            </Link>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl gap-4 border-t border-white/30 pt-8 sm:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit}>
                <p className="text-sm font-medium text-white">{benefit}</p>
                <div className="mx-auto mt-3 h-px w-12 bg-white" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={aboutRef}
        className="grid min-h-screen items-center gap-10 bg-white px-6 py-24 sm:px-10 lg:grid-cols-2"
      >
        <div className="mx-auto w-full max-w-xl">
          <p className="about-reveal mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">
            About Us
          </p>
          <h2
            className="about-reveal text-5xl font-normal uppercase leading-none text-zinc-950 sm:text-7xl"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Built for cleaner hiring
          </h2>
          <p className="about-reveal mt-7 text-lg leading-8 text-zinc-600">
            Hire Vision helps teams move from scattered applications to one
            focused workflow. We keep the hiring process simple, visible, and
            easier for both recruiters and candidates.
          </p>
          <div className="about-reveal about-counts mt-10 grid gap-5 border-t border-zinc-200 pt-8 sm:grid-cols-3">
            <div>
              <p className="about-count text-3xl font-semibold text-zinc-950">01</p>
              <p className="mt-2 text-sm text-zinc-600">Clear resume review</p>
            </div>
            <div>
              <p className="about-count text-3xl font-semibold text-zinc-950">02</p>
              <p className="mt-2 text-sm text-zinc-600">Fast shortlisting</p>
            </div>
            <div>
              <p className="about-count text-3xl font-semibold text-zinc-950">03</p>
              <p className="mt-2 text-sm text-zinc-600">Simple interviews</p>
            </div>
          </div>
        </div>

        <div className="about-reveal recruitment-panel mx-auto w-full max-w-xl overflow-hidden rounded-md border border-zinc-200 bg-white shadow-2xl shadow-zinc-200/70">
          <div className="bg-zinc-950 p-6 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Recruitment Flow
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight">
                  Live hiring board
                </h3>
              </div>
              <span className="status-dot flex h-12 w-12 items-center justify-center rounded-full bg-[#c8f135] text-zinc-950">
                <Sparkles size={22} />
              </span>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {['Applied', 'Reviewed', 'Interview'].map((stage, index) => (
                <div key={stage} className="rounded-md bg-white/10 p-3">
                  <p className="text-2xl font-semibold">{index + 8}</p>
                  <p className="mt-1 text-xs text-zinc-300">{stage}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 bg-zinc-50 p-5">
            <div className="recruitment-step rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <FileText size={20} />
                  </span>
                  <div>
                    <h4 className="font-semibold text-zinc-950">Resume received</h4>
                    <p className="mt-1 text-sm text-zinc-600">Frontend Developer</p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  New
                </span>
              </div>
            </div>

            <div className="recruitment-step rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <UserCheck size={20} />
                  </span>
                  <div>
                    <h4 className="font-semibold text-zinc-950">AI match score</h4>
                    <div className="mt-3 h-2 w-44 rounded-full bg-zinc-200">
                      <div className="h-full w-[86%] rounded-full bg-emerald-500" />
                    </div>
                  </div>
                </div>
                <span className="text-2xl font-semibold text-zinc-950">86%</span>
              </div>
            </div>

            <div className="recruitment-step rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                    <CalendarCheck size={20} />
                  </span>
                  <div>
                    <h4 className="font-semibold text-zinc-950">Interview ready</h4>
                    <p className="mt-1 text-sm text-zinc-600">Shortlisted candidates move next.</p>
                  </div>
                </div>
                <span className="status-dot mt-2 h-3 w-3 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={industriesRef}
        className="relative overflow-hidden bg-zinc-950 px-6 py-24 text-white sm:px-10"
      >
        <canvas
          ref={industriesCanvasRef}
          className="absolute inset-0 h-full w-full opacity-70"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,241,53,0.16),transparent_34%),linear-gradient(180deg,rgba(9,9,11,0.7),#09090b)]" />

        <div className="relative z-10 mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="industry-reveal">
              <p className="industry-eyebrow mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-[#c8f135]">
                Our Expertise In Industries
              </p>
              <h2
                className="text-5xl font-normal uppercase leading-none text-white sm:text-7xl"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                <span className="block overflow-hidden">
                  <span className="industry-title-line block">Hiring</span>
                </span>
                <span className="block overflow-hidden">
                  <span className="industry-title-line block">Support For</span>
                </span>
                <span className="block overflow-hidden">
                  <span className="industry-title-line block">Every Team</span>
                </span>
              </h2>
              <p className="industry-copy mt-6 max-w-2xl text-base leading-7 text-zinc-300">
                Hire Vision adapts to different recruitment pipelines while keeping every
                candidate review, shortlist, and interview step easy to track.
              </p>
            </div>

            <div className="industry-reveal mt-8">
              <RadialOrbitalTimeline
                timelineData={recruitmentTimeline}
                compact
                className="max-w-xl border-0 bg-transparent shadow-none outline-none"
              />
            </div>
          </div>

          <div className="grid content-center gap-5 sm:grid-cols-2">
            {industries.map(({ title, copy, icon: Icon }) => (
              <div
                key={title}
                className="industry-reveal industry-card rounded-md border border-white/10 bg-white/[0.06] p-6 backdrop-blur-md transition hover:border-[#c8f135]/70 hover:bg-white/[0.1]"
              >
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-white text-zinc-950">
                  <Icon size={22} />
                </div>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-zinc-300">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={testimonialsRef}
        className="relative overflow-hidden bg-[#f4f1e8] px-6 py-24 text-zinc-950 sm:px-10"
      >
        <canvas
          ref={testimonialsCanvasRef}
          className="absolute right-0 top-0 h-full w-full opacity-70"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(200,241,53,0.4),transparent_28%),radial-gradient(circle_at_10%_88%,rgba(9,9,11,0.1),transparent_32%)]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="testimonial-kicker mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-zinc-600">
                Client Testimonials
              </p>
              <h2
                className="testimonial-heading max-w-3xl text-5xl font-normal uppercase leading-none text-zinc-950 sm:text-7xl"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                <span className="block overflow-hidden">
                  <span className="block">Teams That</span>
                </span>
                <span className="block overflow-hidden">
                  <span className="block">Hire With</span>
                </span>
                <span className="block overflow-hidden">
                  <span className="block">More Clarity</span>
                </span>
              </h2>
            </div>

            <div className="testimonial-orbit relative ml-auto hidden h-48 w-48 rounded-full border border-zinc-950/15 lg:block">
              <span className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-950" />
              <span className="absolute bottom-8 right-2 h-4 w-4 rounded-full bg-[#c8f135]" />
              <span className="absolute left-5 top-24 h-3 w-3 rounded-full bg-zinc-500" />
              <div className="absolute inset-9 rounded-full border border-dashed border-zinc-950/20" />
              <Quote className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-950" size={38} />
            </div>
          </div>

          <div className="mt-14 h-px overflow-hidden bg-zinc-950/15">
            <div className="testimonial-progress h-full origin-left scale-x-0 bg-zinc-950" />
          </div>

          <div
            ref={testimonialsTrackRef}
            className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4"
          >
            {testimonials.map(({ quote, name, role, metric, metricLabel }, index) => (
              <article
                key={name}
                className="testimonial-card group relative overflow-hidden rounded-[2rem] border border-zinc-950/15 bg-white p-6 shadow-2xl shadow-zinc-900/10 backdrop-blur-md will-change-transform"
              >
                <div className="testimonial-glow pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c8f135]/30 opacity-0 blur-3xl" />
                <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#c8f135]/55 transition duration-500 group-hover:scale-125" />
                <div className="relative flex h-full flex-col justify-between">
                  <div>
                    <div className="mb-8 flex items-center justify-between">
                      <span className="testimonial-quote-badge flex h-13 w-13 items-center justify-center rounded-full bg-zinc-950 text-white">
                        <Quote size={24} />
                      </span>
                      <div className="flex gap-1 text-zinc-950">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <Star
                            key={`${name}-${starIndex}`}
                            size={16}
                            fill="currentColor"
                            className={`testimonial-star ${starIndex > 3 && index === 2 ? 'opacity-35' : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-lg leading-8 text-zinc-950">"{quote}"</p>
                  </div>

                  <div className="mt-8 flex flex-col gap-5 border-t border-zinc-950/10 pt-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-950">{name}</h3>
                      <p className="mt-1 text-sm text-zinc-600">{role}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-3xl font-semibold text-zinc-950">{metric}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                        {metricLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={contactRef}
        className="relative overflow-hidden bg-zinc-950 px-6 py-24 text-white sm:px-10"
      >
        <canvas
          ref={contactCanvasRef}
          className="absolute inset-0 h-full w-full opacity-65"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(200,241,53,0.18),transparent_30%),radial-gradient(circle_at_80%_75%,rgba(255,255,255,0.1),transparent_28%),linear-gradient(180deg,rgba(9,9,11,0.7),#09090b)]" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="contact-kicker mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-[#c8f135]">
              Contact Us
            </p>
            <h2
              className="max-w-3xl text-5xl font-normal uppercase leading-none text-white sm:text-7xl"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              <span className="block overflow-hidden">
                <span className="contact-title-line block">Ready To</span>
              </span>
              <span className="block overflow-hidden">
                <span className="contact-title-line block">Build A Better</span>
              </span>
              <span className="block overflow-hidden">
                <span className="contact-title-line block">Hiring Flow?</span>
              </span>
            </h2>
            <p className="contact-reveal mt-7 max-w-2xl text-lg leading-8 text-zinc-300">
              Share what your team is hiring for. We will help you map a cleaner
              candidate journey from resume upload to interview-ready shortlist.
            </p>

            <div className="mt-10 grid gap-4">
              {contactDetails.map(({ label, value, copy, icon: Icon }) => (
                <article
                  key={label}
                  className="contact-reveal contact-float group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-[#c8f135]/70 hover:bg-white/[0.1]"
                >
                  <span className="contact-signal absolute right-5 top-5 h-12 w-12 rounded-full bg-[#c8f135]/20" />
                  <div className="relative flex gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#c8f135] text-zinc-950 transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                      <Icon size={21} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                        {label}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{value}</h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-300">{copy}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="contact-reveal contact-float relative overflow-hidden rounded-[2rem] border border-white/10 bg-white p-6 text-zinc-950 shadow-2xl shadow-black/30 sm:p-8">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#c8f135]/70 blur-sm" />
            <div className="absolute bottom-8 right-8 hidden h-28 w-28 rounded-full border border-zinc-950/10 sm:block" />

            <div className="relative">
              <div className="mb-8 flex flex-col gap-5 border-b border-zinc-200 pb-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
                    Start The Conversation
                  </p>
                  <h3 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
                    Tell us what you need
                  </h3>
                </div>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-950 text-white">
                  <Send size={22} />
                </span>
              </div>

              <form className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="group block">
                    <span className="text-sm font-semibold text-zinc-700">Name</span>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-zinc-950 outline-none transition duration-300 placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white focus:shadow-lg focus:shadow-zinc-200"
                    />
                  </label>
                  <label className="group block">
                    <span className="text-sm font-semibold text-zinc-700">Work email</span>
                    <input
                      type="email"
                      placeholder="you@company.com"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-zinc-950 outline-none transition duration-300 placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white focus:shadow-lg focus:shadow-zinc-200"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-semibold text-zinc-700">Hiring goal</span>
                  <select className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-zinc-950 outline-none transition duration-300 focus:border-zinc-950 focus:bg-white focus:shadow-lg focus:shadow-zinc-200">
                    <option>Screen resumes faster</option>
                    <option>Manage employer hiring</option>
                    <option>Improve interview scheduling</option>
                    <option>Build an end-to-end hiring workflow</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-zinc-700">Message</span>
                  <textarea
                    rows="5"
                    placeholder="Tell us about your team, roles, and hiring process..."
                    className="mt-2 w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-zinc-950 outline-none transition duration-300 placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white focus:shadow-lg focus:shadow-zinc-200"
                  />
                </label>

                <button
                  type="button"
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-zinc-950 px-8 py-4 text-base font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#c8f135] hover:text-zinc-950 hover:shadow-2xl hover:shadow-lime-300/30"
                >
                  Send message
                  <Send size={18} className="transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <CinematicFooter />
    </main>
  );
}
