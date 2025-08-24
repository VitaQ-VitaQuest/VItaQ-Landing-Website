// file: components/sections/CTA.tsx
import React from 'react';

export const CTA = () => {
  return (
    <section id="demo" className="py-20 sm:py-32 bg-brand-background">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-bold text-brand-text">
            Ready to See it in Action?
          </h2>
          <p className="mt-4 text-lg text-brand-secondary">
            Let's schedule a personalized demo. We'll show you how VitaQ can be tailored to fit the unique needs of your organization.
          </p>
          <a
            href="mailto:demo@vitaq.app" // We can change this to a contact form page later
            className="mt-10 inline-block px-12 py-4 bg-brand-primary text-white font-bold rounded-full text-lg transition-transform duration-300 ease-in-out hover:scale-105"
          >
            Request a Live Demo
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTA;