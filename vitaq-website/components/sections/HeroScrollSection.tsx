// file: components/sections/HeroScrollSection.tsx
'use client';

import React, { useRef, useEffect, RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { useNavbar } from '@/context/NavbarContext';
import { HeroDescription } from './HeroDescription';

gsap.registerPlugin(ScrollTrigger, Flip);

interface AnimationState {
  assemblyProgress: number;
  finalX: number;
}
const HERO_PIN_DURATION = '300%';

export const HeroScrollSection = ({ animationState }: { animationState: RefObject<AnimationState> }) => {
  const pinRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const { logoPlaceholderRef } = useNavbar();

  const finalContentRef = useRef<HTMLDivElement>(null);
  const finalHeadlineRef = useRef<HTMLHeadingElement>(null);
  const finalParagraphRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      if (!pinRef.current || !titleRef.current || !logoPlaceholderRef?.current || !finalContentRef.current) return;

      const titleElement = titleRef.current;
      const placeholderElement = logoPlaceholderRef.current;
      const leftLinks = document.getElementById('left-links');
      const rightLinks = document.getElementById('right-links');
      
      const ctx = gsap.context(() => {
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: pinRef.current, pin: true, scrub: 1, start: 'top top', end: `+=${HERO_PIN_DURATION}`},
        });

        // --- THE CORRECTED AND FINAL TIMELINE ---
        
        // 1. Navbar Frame Widens
        timeline.to(placeholderElement, { width: '150px', duration: 2, ease: 'power2.inOut' }, 0);
        timeline.to(leftLinks, { x: '-50px', duration: 2, ease: 'power2.inOut' }, 0);
        timeline.to(rightLinks, { x: '50px', duration: 2, ease: 'power2.inOut' }, 0);
        
        // 2. The Logo FLIP Animation
        const flipState = Flip.getState(titleElement);
        placeholderElement.appendChild(titleElement);
        titleElement.classList.add('logo-final-state');
        const flipAnimation = Flip.from(flipState, { duration: 2, ease: 'power2.inOut', scale: true });
        timeline.add(flipAnimation, 0);

        // 3. The Tagline Animates OUT
        const taglineWords = gsap.utils.toArray(taglineRef.current?.querySelectorAll('span') ?? []);
        timeline.to(taglineWords, { autoAlpha: 0, y: -40, rotationX: -90, duration: 1, stagger: 0.05, ease: 'power3.in' }, 0);
        
        // 4. The 3D Crystals Animate
        timeline.to(animationState.current, { assemblyProgress: 1, duration: 2, ease: 'power1.inOut' }, 0.2);
        timeline.to(animationState.current, { finalX: -3.5, duration: 2, ease: 'power1.inOut' }, 1);
        
        // 5. THE FIX: The Description Component Animates IN.
        // I have corrected the reference and the animation properties.
        timeline.from(finalContentRef.current, { 
            autoAlpha: 0, 
            x: 50, // A more subtle slide-in
            duration: 1.5 
        }, 1.5); // Starts as the crystal settles
        
        // 6. The Description Component Animates OUT for the next section
        timeline.to(finalContentRef.current, { 
            autoAlpha: 0, 
            duration: 1 
        }, ">+1");

      }, pinRef);
      
      return () => {
          // A proper cleanup function is now correctly implemented.
          gsap.set(titleElement, { clearProps: "all" });
          titleElement.classList.remove('logo-final-state');
          document.getElementById('initial-text-container')?.appendChild(titleElement);
          ctx.revert();
      };
    }, 100);

    return () => clearTimeout(initTimer);
  }, [logoPlaceholderRef, animationState]);

  return (
    // z-50 ensures this entire section is on top of the Header (z-40)
    <div ref={pinRef} className="h-screen relative z-50 pointer-events-none">
        
      {/* THE FIX: A single container for all children of the pinned section */}
      <div className="relative w-full h-full flex items-center justify-center">

        {/* Container for Initial Text */}
        <div id="initial-text-container" className="absolute flex flex-col items-center pointer-events-auto">
          <h1 ref={titleRef} className="text-7xl md:text-9xl font-bold text-brand-text">VitaQ</h1>
          <p ref={taglineRef} className="mt-4 text-lg text-brand-secondary">
            {'The OS for Elite Development.'.split(' ').map((word, index) => (
              <span key={index} className="inline-block mr-2">{word}</span>
            ))}
          </p>
        </div>

        {/* The HeroDescription is correctly rendered here, and the timeline targets it. */}
        <HeroDescription
          finalContentRef={finalContentRef}
          finalHeadlineRef={finalHeadlineRef}
          finalParagraphRef={finalParagraphRef}
        />
      </div>
    </div>
  );
};

export default HeroScrollSection;