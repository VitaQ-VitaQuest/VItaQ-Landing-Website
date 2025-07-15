// file: vitaq-website/components/sections/HeroCanvas.tsx
"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { PrecisionEngine } from './PrecisionEngine';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

export const HeroCanvas = () => {
  return (
    <Canvas>
        <ambientLight intensity={0.2} />
        <hemisphereLight intensity={0.4} groundColor="black" />
        <directionalLight
            position={[10, 10, 5]}
            intensity={2}
            color="#E54593"
        />
        <directionalLight
            position={[-10, 5, -5]}
            intensity={1.5}
            color="#00F0FF"
        />
        
        <Suspense fallback={null}>
            <Stars count={2000} factor={4} saturation={0} fade speed={0.5} />
            {/* The PrecisionEngine now controls itself directly */}
            <PrecisionEngine />
        </Suspense>

        <EffectComposer>
            <Bloom 
                intensity={0.4}
                luminanceThreshold={0.5}
                luminanceSmoothing={0.2}
                height={1000}
            />
        </EffectComposer>
    </Canvas>
  );
};

export default HeroCanvas;