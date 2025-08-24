// file: components/sections/PrecisionEngine.tsx
"use client";

import React, { useMemo, useRef, RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

interface AnimationState {
  assemblyProgress: number;
  finalX: number;
}

interface CrystalProps {
    modelUrl: string;
    initialPos: THREE.Vector3;
    initialRot: THREE.Euler;
    finalPos: THREE.Vector3;
    scale: number;
    animationState: RefObject<AnimationState>;
    orbitRadius: number;
    orbitSpeed: number;
}

const Crystal = ({ modelUrl, initialPos, initialRot, finalPos, scale, animationState, orbitRadius, orbitSpeed }: CrystalProps) => {
    const groupRef = useRef<THREE.Group>(null);
    const gltf = useGLTF(modelUrl);
    const copiedScene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
    const { pointer, clock } = useThree();

    useFrame(() => {
        if (!groupRef.current || !animationState.current) return;
        const { assemblyProgress } = animationState.current;

        const assemblyPoint = new THREE.Vector3(0, -1, 0); 
        const orbitX = Math.cos(clock.elapsedTime * orbitSpeed) * orbitRadius;
        const orbitZ = Math.sin(clock.elapsedTime * orbitSpeed) * orbitRadius;
        const orbitalPosition = new THREE.Vector3(orbitX, 0, orbitZ).add(assemblyPoint);
        const currentPos = new THREE.Vector3().lerpVectors(initialPos, orbitalPosition, assemblyProgress);
        
        // THE FIX: Restore mouse interactivity by adding the push as an offset.
        const pushForce = Math.max(0, 1 - groupRef.current.position.distanceTo(new THREE.Vector3(pointer.x * 2, pointer.y * 2, 0)) / 10);
        const pushDirection = new THREE.Vector3().subVectors(groupRef.current.position, new THREE.Vector3(pointer.x * 2, pointer.y * 2, 0)).normalize();
        currentPos.add(pushDirection.multiplyScalar(pushForce * 0.2 * (1 - assemblyProgress))); // Push effect fades out
        
        groupRef.current.position.copy(currentPos);
        
        // THE FIX: Shards now grow slightly as they orbit.
        const targetScale = scale * 1.2;
        const currentScale = THREE.MathUtils.lerp(scale, targetScale, assemblyProgress);
        groupRef.current.scale.setScalar(currentScale);
    });

    return <primitive ref={groupRef} object={copiedScene} scale={scale} position={initialPos} rotation={initialRot} />;
};

const MainBundle = ({ animationState }: { animationState: RefObject<AnimationState> }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { scene } = useGLTF('/models/crystal_bundle.glb');
    
    useFrame(() => {
        if (!groupRef.current || !animationState.current) return;
        const { assemblyProgress } = animationState.current;
        // THE FIX: Main crystal now shrinks based on scroll progress.
        const currentScale = THREE.MathUtils.lerp(0.06, 0.045, assemblyProgress);
        groupRef.current.scale.setScalar(currentScale);
    });

    // Accepting your corrected initial position and rotation.
    return <primitive ref={groupRef} object={scene} scale={0.06} position={[0, -2, 0]} rotation={[-0.1, 0, 0]} />;
}


export const PrecisionEngine = ({ animationState }: { animationState: RefObject<AnimationState> }) => {
    const masterGroupRef = useRef<THREE.Group>(null);

    // THE FIX: Orbit speed values are reduced for a slower, more majestic rotation.
    const orbitingShardsData = useMemo(() => [
        { id: 1, url: '/models/stylized_crystal.glb', scale: 0.5, initialPos: new THREE.Vector3(-3.5, 1.5, 0), initialRot: new THREE.Euler(0.5,0.5,0), finalPos: new THREE.Vector3(0.8, -0.5, 0.8), orbitRadius: 2.5, orbitSpeed: 0.3 },
        { id: 2, url: '/models/crystal.glb', scale: 0.4, initialPos: new THREE.Vector3(4, -1, 0), initialRot: new THREE.Euler(-0.5,-0.5,0), finalPos: new THREE.Vector3(-0.7, -1.5, -0.6), orbitRadius: 3, orbitSpeed: -0.25 },
        { id: 3, url: '/models/magic_crystals.glb', scale: 0.008, initialPos: new THREE.Vector3(2.5, 3, 0), initialRot: new THREE.Euler(0,1,0), finalPos: new THREE.Vector3(0.5, 0.2, -0.9), orbitRadius: 3.5, orbitSpeed: 0.4 },
        { id: 4, url: '/models/enchanted_crystal.glb', scale: 6.0, initialPos: new THREE.Vector3(-3, -3, 0), initialRot: new THREE.Euler(1,0,1), finalPos: new THREE.Vector3(-0.9, -0.2, 0.7), orbitRadius: 4, orbitSpeed: -0.2 },
        { id: 5, url: '/models/crystal--.glb', scale: 0.3, initialPos: new THREE.Vector3(0.5, 3.8, 0), initialRot: new THREE.Euler(1,1,1), finalPos: new THREE.Vector3(0.1, 0.5, 0.2), orbitRadius: 2, orbitSpeed: 0.5 },
        { id: 6, url: '/models/stylized_crystal--.glb', scale: 0.4, initialPos: new THREE.Vector3(4, 2.5, 0), initialRot: new THREE.Euler(-1,-1,0), finalPos: new THREE.Vector3(1.1, -1.2, 0.3), orbitRadius: 4.5, orbitSpeed: 0.15 },
    ], []);

    useFrame(() => {
        if (masterGroupRef.current && animationState.current) {
            masterGroupRef.current.position.x = animationState.current.finalX;
        }
    });

    return (
        <group ref={masterGroupRef}>
            {/* MainBundle now correctly receives the animationState */}
            <MainBundle animationState={animationState} />
            
            {orbitingShardsData.map((data) => (
                <Crystal 
                  key={data.id} 
                  modelUrl={data.url}
                  initialPos={data.initialPos}
                  initialRot={data.initialRot}
                  finalPos={data.finalPos}
                  scale={data.scale}
                  orbitRadius={data.orbitRadius}
                  orbitSpeed={data.orbitSpeed}
                  animationState={animationState}
                />
            ))}
        </group>
    );
};

// Preloads are essential and remain.
useGLTF.preload('/models/crystal_bundle.glb');
useGLTF.preload('/models/crystal.glb');
useGLTF.preload('/models/crystal--.glb');
useGLTF.preload('/models/magic_crystals.glb');
useGLTF.preload('/models/enchanted_crystal.glb');
useGLTF.preload('/models/stylized_crystal.glb');
useGLTF.preload('/models/stylized_crystal--.glb');
export default PrecisionEngine;