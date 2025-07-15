// file: components/layout/Preloader.tsx
"use client";

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { VitaQLogo } from '../common/VitaQLogo';
// --- NEW IMPORTS for the star background ---
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

interface PreloaderProps {
  onAnimationComplete: () => void;
}

export const Preloader = ({ onAnimationComplete }: PreloaderProps) => {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const logoV = logoRef.current?.querySelector("#logo-v-neon");
      const logoQ = logoRef.current?.querySelector("#logo-q-neon");
      const glowFilter = logoRef.current?.querySelector("#glowFilter");
      
      if (!logoV || !logoQ || !glowFilter) return;

      const lengthV = (logoV as SVGPathElement).getTotalLength();
      const lengthQ = (logoQ as SVGPathElement).getTotalLength();

      gsap.timeline({
        onComplete: () => {
          if (onAnimationComplete) onAnimationComplete();
        }
      })
      .set(preloaderRef.current, { autoAlpha: 1 })
      .set(logoRef.current, { autoAlpha: 1 })
      .set([logoV, logoQ], { 
        strokeDasharray: (i) => i === 0 ? lengthV : lengthQ,
        strokeDashoffset: (i) => i === 0 ? lengthV : lengthQ,
      })
      .to(logoV, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' })
      .to(logoQ, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, "-=1.3")
      .to([logoRef.current, glowFilter], {
        scale: 1.05,
        attr: { stdDeviation: 22 },
        duration: 0.8,
        ease: 'power3.inOut',
        yoyo: true,
        repeat: 2,
      }, "-=1.0")
      .to(preloaderRef.current, {
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.3
      });

    }, preloaderRef);

    return () => ctx.revert();

  }, [onAnimationComplete]);

  return (
    // --- MODIFIED: The grid-background class is gone, and a Canvas is added ---
    <div ref={preloaderRef} className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-background opacity-0 invisible">
      <Canvas style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}>
        <Stars count={2000} factor={4} saturation={0} fade speed={0.5} />
      </Canvas>
      <VitaQLogo ref={logoRef} className="w-24 h-24 opacity-0 invisible" />
    </div>
  );
};

export default Preloader;