// file: components/sections/HeroDescription.tsx
"use client";

import React, { RefObject } from 'react';

interface HeroDescriptionProps {
    finalContentRef: RefObject<HTMLDivElement | null>;
    finalHeadlineRef: RefObject<HTMLHeadingElement | null>;
    finalParagraphRef: RefObject<HTMLParagraphElement | null>;
}

export const HeroDescription = React.forwardRef<HTMLDivElement, HeroDescriptionProps>(
    ({ finalContentRef, finalHeadlineRef, finalParagraphRef }, ref) => {
    return (
        <div ref={finalContentRef} className="absolute w-full h-full flex items-center justify-end opacity-0 pointer-events-none">
            <div className='max-w-xl text-left pointer-events-auto pr-10 md:pr-20'>
              <h2 ref={finalHeadlineRef} className="text-5xl md:text-6xl font-bold text-brand-text leading-tight overflow-hidden">
                <span className="inline-block">Unlock Peak</span><br/>
                <span className="inline-block">Performance.</span>
              </h2>
              <p ref={finalParagraphRef} className="mt-6 text-lg md:text-xl text-brand-secondary">
                VitaQ is the white-label platform for academies and institutions to measure, manage, and master trainee growth.
              </p>
            </div>
        </div>
    );
});

HeroDescription.displayName = 'HeroDescription';