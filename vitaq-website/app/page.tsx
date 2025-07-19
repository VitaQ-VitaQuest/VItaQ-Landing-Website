// file: app/page.tsx
"use client"; 

import { useRef } from 'react'; // Import useRef
import { HeroCanvas } from '@/components/sections/HeroCanvas';
import { HeroScrollSection } from '@/components/sections/HeroScrollSection';
import { SocialProof } from '@/components/sections/SocialProof';
import { ProblemSolution } from '@/components/sections/ProblemSolution';
import { FeatureShowcase } from '@/components/sections/FeatureShowcase';
import { Architecture } from '@/components/sections/Architecture';
import { CTA } from '@/components/sections/CTA';

export default function HomePage() {
  // This ref will hold the animation progress values.
  // It acts as a bridge between GSAP and our 3D scene.
  const animationState = useRef({
    assemblyProgress: 0, // 0 = scattered, 1 = assembled
    finalX: 0,           // The final X position for the assembled model
  });

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-screen z-0">
        {/* Pass the state bridge to the 3D canvas */}
        <HeroCanvas animationState={animationState} />
      </div>

      {/* Pass the state bridge to the scroll animation controller */}
      <HeroScrollSection animationState={animationState} />
      
      <main className="relative z-10 bg-brand-background">
        <SocialProof />
        <ProblemSolution />
        <FeatureShowcase />
        <Architecture />
        <CTA />
      </main>
    </>
  );
}