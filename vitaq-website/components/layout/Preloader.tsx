// file: components/layout/Preloader.tsx
"use client";

import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { VitaQLogo } from '../common/VitaQLogo';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useLoading } from '@/context/LoadingContext';

interface PreloaderProps {
  onAnimationComplete: () => void;
}

export const Preloader = ({ onAnimationComplete }: PreloaderProps) => {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const { progress: assetProgress, isLoaded } = useLoading();
  const [displayProgress, setDisplayProgress] = useState(0);
  
  const exitTimeline = useRef<gsap.core.Timeline | null>(null);

  // Effect for the complete entry animation, starts immediately on mount
  useEffect(() => {
    const logoV = logoRef.current?.querySelector("#logo-v-neon");
    const logoQ = logoRef.current?.querySelector("#logo-q-neon");
    if (!preloaderRef.current || !logoRef.current || !textRef.current || !logoV || !logoQ) return;
    
    const lengthV = (logoV as SVGPathElement).getTotalLength();
    const lengthQ = (logoQ as SVGPathElement).getTotalLength();

    // The GSAP timeline now controls the entire entry sequence from an invisible state
    const entryTl = gsap.timeline();
    entryTl
      .set(preloaderRef.current, { autoAlpha: 1 }) // Make the container visible
      .set(logoRef.current, { autoAlpha: 1 }) // Make the logo container visible
      .set(textRef.current, { autoAlpha: 0, y: 10 }) // Hide text initially
      .set([logoV, logoQ], { strokeDasharray: lengthV > lengthQ ? lengthV : lengthQ, strokeDashoffset: lengthV > lengthQ ? lengthV : lengthQ })
      .to(logoV, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' })
      .to(logoQ, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, "-=1.0")
      .to(textRef.current, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, "-=0.5");
  }, []);

  // Effect for animating the progress percentage
  useEffect(() => {
    const counter = { value: displayProgress };
    const targetProgress = 10 + (assetProgress * 0.9);
    gsap.to(counter, {
      value: targetProgress,
      duration: 1.0,
      ease: 'power2.out',
      onUpdate: () => setDisplayProgress(counter.value)
    });
  }, [assetProgress]);

  // Effect for the final pulse-and-fade exit
  useEffect(() => {
    if (isLoaded && !exitTimeline.current) {
      exitTimeline.current = gsap.timeline({
        delay: 0.5,
        onComplete: () => { if (onAnimationComplete) onAnimationComplete(); },
      });
      exitTimeline.current.to(contentRef.current, {
        scale: 1.05,
        duration: 0.4,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 1,
      });
      exitTimeline.current.to(preloaderRef.current, {
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '+=0.2');
    }
  }, [isLoaded, onAnimationComplete]);
  
  return (
    // The component starts invisible and is made visible by the GSAP timeline.
    <div ref={preloaderRef} className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-background opacity-0 invisible">
        <Canvas style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}>
            <Stars count={2000} factor={4} saturation={0} fade speed={0.5} />
        </Canvas>
        <div ref={contentRef} className="flex flex-col items-center gap-4">
            <VitaQLogo ref={logoRef} className="w-24 h-24" />
            <div ref={textRef} className="text-brand-secondary font-mono tracking-widest">
                LOADING {Math.min(Math.ceil(displayProgress), 100)}%
            </div>
        </div>
    </div>
  );
};

export default Preloader;