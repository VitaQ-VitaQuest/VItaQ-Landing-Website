// file: components/sections/FeatureShowcase.tsx
"use client"; // Must be a client component to use hooks

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FeatureHighlight = ({ title, children, icon }: { title: string, children: React.ReactNode, icon: string }) => (
  // Added a class for GSAP to target
  <div className="feature-highlight rounded-lg p-6 bg-brand-surface hover:bg-brand-surface/60 transition-colors cursor-pointer">
    <div className="flex items-center gap-4">
      <span className="text-2xl">{icon}</span>
      <h3 className="font-bold text-xl text-brand-text">{title}</h3>
    </div>
    <p className="mt-3 text-brand-secondary">{children}</p>
  </div>
);


export const FeatureShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the feature highlights and the visual placeholder
      gsap.from(".feature-highlight", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
          toggleActions: "play none none none"
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.2
      });
      gsap.from(".visual-placeholder", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
          toggleActions: "play none none none"
        },
        scale: 0.8,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-20 sm:py-32 bg-brand-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-bold text-brand-text">
            An OS for Every Aspect of Development
          </h2>
          <p className="mt-4 text-lg text-brand-secondary">
            VitaQ provides the tools to manage the entire lifecycle of trainee growth, from curriculum design to performance analysis.
          </p>
        </div>
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
          <div className="flex flex-col gap-8">
            <FeatureHighlight icon="🎯" title="The Evaluation Engine">Administer precise, data-driven assessments with a live interface that tracks progress in real-time. Turn every session into quantifiable data.</FeatureHighlight>
            <FeatureHighlight icon="🎨" title="Dynamic White-Labeling">Deploy a fully-branded experience for your organization. Your colors, your logos, your fonts—a seamless extension of your brand identity.</FeatureHighlight>
            <FeatureHighlight icon="📚" title="Holistic Curriculum Management">Design developmental pathways, build a rich library of exercises, and set measurable goals for individuals or entire groups.</FeatureHighlight>
          </div>
          <div className="flex items-center justify-center min-h-[500px] lg:min-h-0 visual-placeholder">
            <div className="w-full max-w-sm h-[600px] rounded-[40px] bg-brand-surface border-4 border-brand-secondary/20 flex items-center justify-center">
              <div className="text-center text-brand-secondary">
                <h3 className="text-xl font-bold">[ Interactive 3D Model ]</h3>
                <p className="mt-2 text-sm">This area will feature our live demo.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;