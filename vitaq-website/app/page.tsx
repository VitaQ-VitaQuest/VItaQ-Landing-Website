// file: app/page.tsx
"use client"; 

import { HeroCanvas } from '@/components/sections/HeroCanvas';
import { Hero } from '@/components/sections/Hero';
import { SocialProof } from '@/components/sections/SocialProof';
import { ProblemSolution } from '@/components/sections/ProblemSolution';
import { FeatureShowcase } from '@/components/sections/FeatureShowcase';
import { Architecture } from '@/components/sections/Architecture';
import { CTA } from '@/components/sections/CTA';

export default function HomePage() {
  return (
    <>
      <div className="fixed top-0 left-0 w-full h-screen z-0">
        <HeroCanvas />
      </div>
      
      {/* The main content now scrolls on the main browser thread, as it should */}
      <main className="relative z-10 bg-transparent">
        <Hero />
        <SocialProof />
        <ProblemSolution />
        <FeatureShowcase />
        <Architecture />
        <CTA />
      </main>
    </>
  );
}