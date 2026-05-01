import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import * as THREE from 'three';

export default function SplashScreen({ onFinish }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!wrapperRef.current || !canvasRef.current) return undefined;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => {
          gsap.to(wrapperRef.current, {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.inOut',
            onComplete: onFinish,
          });
        },
      });

      // Eye opening animation - screen splits open from middle
      timeline
        .from('.splash-iris-inner', {
          clipPath: 'inset(50% 0)',
          duration: 2.4,
          ease: 'sine.inOut',
        });

      gsap.to('.splash-grid-line', {
        opacity: 0.75,
        duration: 1.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.08,
      });
    }, wrapperRef);

    const canvas = canvasRef.current;
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
    sceneRef.current = group;

    // Particle System
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 250;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let index = 0; index < particleCount; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 12;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 9;
      
      velocities[index * 3] = (Math.random() - 0.5) * 0.08;
      velocities[index * 3 + 1] = (Math.random() - 0.5) * 0.08;
      velocities[index * 3 + 2] = (Math.random() - 0.5) * 0.08;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xc8f135,
      size: 0.04,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particles.userData.velocities = velocities;
    group.add(particles);

    // Enhanced Rotating Rings
    // Enhanced liquid effect with simple material
    const liquidGeometry = new THREE.IcosahedronGeometry(2, 5);
    const liquidMaterial = new THREE.MeshPhongMaterial({
      color: 0xc8f135,
      emissive: 0x669900,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
      shininess: 100,
    });

    const liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
    liquidMesh.scale.set(0.8, 0.8, 0.8);
    group.add(liquidMesh);

    // Add Floating Spheres
    const sphereGroup = new THREE.Group();
    const spheres = [];
    for (let i = 0; i < 3; i += 1) {
      const sphereGeom = new THREE.IcosahedronGeometry(0.3 + i * 0.15, 4);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.32, 1, 0.5 + i * 0.1),
        transparent: true,
        opacity: 0.4,
        wireframe: true,
      });
      const sphere = new THREE.Mesh(sphereGeom, sphereMat);
      sphere.position.set(
        Math.cos(i * Math.PI * 0.66) * 2.5,
        Math.sin(i * Math.PI * 0.66) * 2,
        i * 1.5 - 1.5
      );
      sphere.userData.orbitAngle = i * (Math.PI * 0.66);
      sphere.userData.orbitRadius = 2.5;
      sphere.userData.orbitHeight = 2;
      sphereGroup.add(sphere);
      spheres.push(sphere);
    }
    group.add(sphereGroup);

    // Add Central Rotating Object
    const coreGeom = new THREE.OctahedronGeometry(0.6, 3);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xc8f135,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });
    const coreObject = new THREE.Mesh(coreGeom, coreMat);
    group.add(coreObject);

    const pointer = { x: 0, y: 0 };
    let time = 0;

    const resize = () => {
      const { clientWidth, clientHeight } = canvas.parentElement;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    const handlePointerMove = (event) => {
      const bounds = wrapperRef.current.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -2;
    };

    resize();
    window.addEventListener('resize', resize);
    wrapperRef.current.addEventListener('pointermove', handlePointerMove);

    let frameId;
    const animate = () => {
      time += 0.016;

      // Particle motion with velocity
      const posAttr = particles.geometry.getAttribute('position');
      const pos = posAttr.array;
      for (let i = 0; i < particleCount; i += 1) {
        const velIdx = i * 3;
        pos[velIdx] += velocities[velIdx];
        pos[velIdx + 1] += velocities[velIdx + 1];
        pos[velIdx + 2] += velocities[velIdx + 2];

        // Wrap around boundaries
        if (Math.abs(pos[velIdx]) > 12) velocities[velIdx] *= -1;
        if (Math.abs(pos[velIdx + 1]) > 8) velocities[velIdx + 1] *= -1;
        if (Math.abs(pos[velIdx + 2]) > 9) velocities[velIdx + 2] *= -1;
      }
      posAttr.needsUpdate = true;

      // Rotate core object
      coreObject.rotation.x += 0.004;
      coreObject.rotation.y += 0.006;
      coreObject.rotation.z += 0.003;
      coreObject.scale.set(
        1 + Math.sin(time * 1.2) * 0.15,
        1 + Math.cos(time * 1.2) * 0.15,
        1 + Math.sin(time * 1.2) * 0.15
      );

      // Rotate liquid mesh
      liquidMesh.rotation.x += 0.002;
      liquidMesh.rotation.y += 0.004;
      liquidMesh.rotation.z += 0.001;
      liquidMesh.position.y = Math.sin(time * 0.5) * 0.5;

      // Orbit spheres around center
      spheres.forEach((sphere) => {
        sphere.userData.orbitAngle += 0.008;
        sphere.position.x = Math.cos(sphere.userData.orbitAngle) * sphere.userData.orbitRadius;
        sphere.position.y = Math.sin(sphere.userData.orbitAngle * 0.7) * sphere.userData.orbitHeight;
        sphere.rotation.x += 0.006;
        sphere.rotation.y += 0.009;
        sphere.rotation.z += 0.003;
      });

      // Main group rotation with pointer interaction
      group.rotation.y += 0.0015 + pointer.x * 0.002;
      group.rotation.x += (pointer.y * 0.05 - group.rotation.x) * 0.02;
      group.position.x += (pointer.x * 0.4 - group.position.x) * 0.05;
      group.position.y += (pointer.y * 0.3 - group.position.y) * 0.05;

      particles.rotation.z += 0.0005;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      ctx.revert();
      window.removeEventListener('resize', resize);
      wrapperRef.current?.removeEventListener('pointermove', handlePointerMove);
      window.cancelAnimationFrame(frameId);
      particleGeometry.dispose();
      particleMaterial.dispose();
      liquidGeometry.dispose();
      liquidMaterial.dispose();
      coreGeom.dispose();
      coreMat.dispose();
      spheres.forEach((sphere) => {
        sphere.geometry.dispose();
        sphere.material.dispose();
      });
      renderer.dispose();
    };
  }, [onFinish]);

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-[9999] overflow-hidden bg-zinc-950"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(200,241,53,0.24),transparent_30%),linear-gradient(180deg,rgba(9,9,11,0.72),#09090b_78%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-40 [perspective:900px]">
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={index}
            className="splash-grid-line absolute left-1/2 top-1/2 h-px w-[120vw] origin-left bg-[#c8f135]/25"
            style={{
              transform: `translate3d(-50%, ${index * 42 - 170}px, ${index * -22}px) rotateX(64deg)`,
            }}
          />
        ))}
      </div>

      {/* Glassmorphism Center Orb */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Center glass orb */}
        <div 
          className="absolute left-1/2 top-1/2 w-40 h-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-gradient-to-br from-[#c8f135]/20 to-transparent backdrop-blur-2xl shadow-2xl overflow-hidden flex items-center justify-center"
          style={{
            animation: 'pulse-glow 4s ease-in-out infinite',
            boxShadow: '0 0 40px rgba(200, 241, 53, 0.3), inset 0 0 40px rgba(200, 241, 53, 0.1)',
          }}
        >
          <div className="w-32 h-32 rounded-full border border-[#c8f135]/40 bg-[#c8f135]/10 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c8f135]/40 to-transparent blur-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Eye Opening - Screen splits from middle */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="splash-iris-inner absolute inset-0 bg-zinc-950" style={{ clipPath: 'inset(50% 0)' }} />
      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.6); }
        }
        @keyframes wave {
          0%, 100% { transform: scaleY(0.6); opacity: 0.5; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
