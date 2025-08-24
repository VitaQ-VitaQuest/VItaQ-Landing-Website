// file: components/sections/HeroCanvas.tsx
"use client";

import React, { Suspense, RefObject, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, useProgress } from '@react-three/drei';
import { PrecisionEngine } from './PrecisionEngine';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useLoading } from '@/context/LoadingContext'; // We still need the context hook

// Define the types for our props
interface AnimationState {
  assemblyProgress: number;
  finalX: number;
}
interface HeroCanvasProps {
  animationState: RefObject<AnimationState>;
}

// --- THE FIX: This component is now a permanent sibling, not a temporary fallback ---
function AssetLoader() {
  const { active, progress } = useProgress();
  const { setProgress, setIsLoaded } = useLoading();

  useEffect(() => {
    // Report the current loading progress to the context
    setProgress(progress);
    
    // When progress hits 100% AND Suspense is no longer active, we are truly done.
    if (progress >= 100 && !active) {
      // Use a small timeout to prevent any flash and ensure state propagation
      setTimeout(() => {
        setIsLoaded(true);
      }, 500);
    }
  }, [progress, active, setProgress, setIsLoaded]);

  return null; // It renders nothing visible
}


export const HeroCanvas = ({ animationState }: HeroCanvasProps) => {
  return (
    <Canvas>
        {/* The AssetLoader is now a direct child, it will always be mounted. */}
        <AssetLoader />

        <ambientLight intensity={0.2} />
        <hemisphereLight intensity={0.4} groundColor="black" />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#E54593" />
        <directionalLight position={[-10, 5, -5]} intensity={1.5} color="#00F0FF" />
        
        {/* The Suspense fallback can now be null, as AssetLoader handles progress. */}
        <Suspense fallback={null}>
            <Stars count={2000} factor={4} saturation={0} fade speed={0.5} />
            <PrecisionEngine animationState={animationState} />
        </Suspense>

        <EffectComposer>
            <Bloom intensity={0.4} luminanceThreshold={0.5} luminanceSmoothing={0.2} height={1000} />
        </EffectComposer>
    </Canvas>
  );
};

export default HeroCanvas;