// file: components/common/VitaQLogo.tsx
import React from 'react';

export const VitaQLogo = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg 
      id="Layer_1" 
      data-name="Layer 1" 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 1000 1000"
      {...props}
    >
      <defs>
        {/* We add an ID to the filter so GSAP can target its attributes */}
        <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur id="glowFilter" stdDeviation="15" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <path 
        id="logo-q-neon" 
        stroke="#F000B8"
        strokeWidth="20"
        fill="none"
        filter="url(#neon-glow)"
        d="M604.55,340.36l133-230.36,122.37,59.06-88.67,127.75c-7.46,10.75-2.81,25.66,9.45,30.25l147.37,55.21-82.81,143.43-226.02-130.49c-19.2-11.09-25.78-35.64-14.7-54.85Z"
      />
      {/* The stroke for the V is now white */}
      <path 
        id="logo-v-neon" 
        stroke="#FFFFFF" 
        strokeWidth="20"
        fill="none"
        filter="url(#neon-glow)"
        d="M817.66,573.52l-82.81,143.42-121.13-99.73c-10.09-8.31-25.3-4.91-30.9,6.9l-115.19,242.93c-14.57,30.72-58.33,30.56-72.68-.26l-17.45-37.49-.15.07L71.92,174.37l136.46-63.64,219.96,471.69c6.86,14.72,27.46,15.62,35.58,1.55l72.88-126.24c11.09-19.2,35.64-25.78,54.85-14.7l226.01,130.49Z"
      />
    </svg>
  );
};

export default VitaQLogo;