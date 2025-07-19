// file: components/sections/Hero.tsx
import React from 'react';

export const Hero = () => {
  return (
    // This section is now the ONLY part of the page with this special property.
    // It is positioned relative and has a defined height to fill the screen.
    // pointer-events-none allows the mouse to "pass through" to the canvas behind it.
    <section className="relative z-10 h-screen flex items-center justify-center pointer-events-none">

      {/* This inner div re-enables mouse events ONLY for the text and buttons. */}
      <div className="max-w-7xl mx-auto px-6 text-center pointer-events-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-brand-text leading-tight">
          Unlock Peak Performance.
          <br />
          The OS for <span className="text-brand-primary">Elite Development.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-brand-secondary max-w-3xl mx-auto">
          VitaQ is the white-label platform for academies and institutions to measure, manage, and master trainee growth.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#demo"
            className="px-8 py-3 bg-brand-primary text-white font-bold rounded-full transition-transform duration-300 ease-in-out hover:scale-105"
          >
            Request a Demo
          </a>
          <a
            href="#features"
            className="px-8 py-3 text-brand-secondary font-bold rounded-full transition-colors duration-300 hover:text-brand-text"
          >
            See it in Action
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;