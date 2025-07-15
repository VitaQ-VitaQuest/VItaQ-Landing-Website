// file: components/sections/ProblemSolution.tsx
"use client";

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FeatureItem = ({ icon, title, children, isSolution }: { icon: string, title: string, children: React.ReactNode, isSolution?: boolean }) => (
  // Added a class for GSAP to target
  <div className="feature-item text-left"> 
    <div className="flex items-center gap-4">
      <span className={`flex items-center justify-center w-8 h-8 rounded-full ${isSolution ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-surface text-brand-secondary'}`}>
        {icon}
      </span>
      <h3 className="font-bold text-lg text-brand-text">{title}</h3>
    </div>
    <p className="mt-2 text-brand-secondary">
      {children}
    </p>
  </div>
);


export const ProblemSolution = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered animation for each feature item for a more dynamic feel
      gsap.from(".feature-item", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%", // Start animation sooner
          toggleActions: "play none none none"
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.2 // Animate each item 0.2s after the previous one
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="features" className="py-20 sm:py-32 bg-brand-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-bold text-brand-text">
            Stop Guessing. Start Engineering.
          </h2>
          <p className="mt-4 text-lg text-brand-secondary">
            Your organization runs on data. Your development process should too.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          <div className="space-y-12">
            <h3 className="text-2xl font-bold text-center text-brand-secondary">The Old Way</h3>
            <FeatureItem icon="😵" title="Fragmented Data">Juggling spreadsheets, emails, and paper forms leads to lost data and wasted time.</FeatureItem>
            <FeatureItem icon="📉" title="Subjective Feedback">"Good job" isn't a metric. Without objective data, true progress is impossible to track.</FeatureItem>
            <FeatureItem icon="📞" title="Disconnected Communication">Parents and trainees are left in the dark, leading to disengagement and confusion.</FeatureItem>
          </div>
          <div className="space-y-12 p-8 rounded-2xl bg-brand-background border border-brand-primary/20">
             <h3 className="text-2xl font-bold text-center text-brand-text">The VitaQ Way</h3>
            <FeatureItem icon="✅" title="Unified Ecosystem" isSolution>One central hub for all data, from curriculum design to individual performance metrics.</FeatureItem>
            <FeatureItem icon="📈" title="Data-Driven Evaluations" isSolution>Define, measure, and track every parameter. Turn every evaluation into actionable insight.</FeatureItem>
            <FeatureItem icon="🤝" title="Engaged Stakeholders" isSolution>Provide parents and trainees with a clear, personalized window into their entire development journey.</FeatureItem>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;