import { useEffect, useRef, useState } from 'react';
import { TubesCursor } from './tube-cursor';

interface TubesSplashScreenProps {
  onFinish: () => void;
}

export default function TubesSplashScreen({ onFinish }: TubesSplashScreenProps) {
  const splashRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Mark as ready after a short delay to ensure the canvas is initialized
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    const timer = setTimeout(() => {
      if (splashRef.current) {
        splashRef.current.style.opacity = '0';
        splashRef.current.style.pointerEvents = 'none';
        splashRef.current.style.transition = 'opacity 0.8s ease-out';
        setTimeout(() => {
          onFinish();
        }, 800);
      }
    }, 3500);

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <div
      ref={splashRef}
      className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-300 ${!isReady ? 'opacity-0' : 'opacity-100'}`}
    >
      <TubesCursor
        title="Hire Vision"
        subtitle="AI Recruitment"
        caption="Click to explore - Powered by AI"
        initialColors={["#c8f135", "#83f36e", "#53bc28"]}
        lightColors={["#c8f135", "#83f36e", "#53bc28", "#a3f634"]}
        lightIntensity={250}
        titleSize="text-[70px]"
        subtitleSize="text-[50px]"
        captionSize="text-lg"
        enableRandomizeOnClick
      />
    </div>
  );
}
