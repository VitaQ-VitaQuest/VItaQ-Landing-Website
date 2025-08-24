// file: components/sections/SocialProof.tsx
import React from 'react';

// For now, we'll use simple text as placeholders for logos.
// Later, we can replace these with actual <Image> components.
const logos = [
  'Rollsiders',
  'Elite Academy',
  'Pro Training',
  'NextGen Sports',
  'Apex Institute',
  'Velocity Prep',
];

// We need to duplicate the logos to create the seamless infinite scroll effect
const extendedLogos = [...logos, ...logos];

export const SocialProof = () => {
  return (
    <section className="py-12 bg-brand-background">
      <div className="text-center mb-8">
        <h2 className="text-sm font-bold uppercase text-brand-secondary tracking-widest">
          Trusted by the World's Best
        </h2>
      </div>
      
      {/* 
        This is the container for our infinite scroller. 
        'overflow-hidden' hides the duplicated logos outside the view.
        The [mask-image] is a CSS trick to fade out the edges for a seamless look.
      */}
      <div className="relative w-full max-w-5xl mx-auto overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        
        {/* The 'animate-infinite-scroll' class will be a custom animation we add */}
        <div className="flex w-max animate-infinite-scroll">
          {extendedLogos.map((logo, index) => (
            <div key={index} className="flex items-center justify-center flex-shrink-0 w-64 h-20">
              <span className="text-2xl font-bold text-brand-secondary/50">
                {logo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;