// file: vitaq-website/components/sections/PrecisionEngine.tsx
"use client";

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber'; // Ensure useThree is imported
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

const CrystalShard = ({ initialPosition, modelUrl, scale = 0.2 }: { initialPosition: THREE.Vector3; modelUrl: string; scale?: number; }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { scene } = useGLTF(modelUrl);
    const copiedScene = useMemo(() => scene.clone(), [scene]);
    const { pointer } = useThree(); // Each shard gets live pointer data

    useFrame((_state, delta) => {
        if (groupRef.current) {
            const target = new THREE.Vector3(pointer.x * 2, pointer.y * 2, 0);
            const dist = groupRef.current.position.distanceTo(target);
            const force = Math.max(0, 1 - dist / 5);
            const pushDirection = groupRef.current.position.clone().sub(target).normalize();
            const targetPosition = initialPosition.clone().add(pushDirection.multiplyScalar(force * 2.0));
            
            groupRef.current.position.lerp(targetPosition, delta * 2.0);
            groupRef.current.rotation.y += delta * 0.5;
        }
    });

    return <primitive ref={groupRef} object={copiedScene} scale={scale} />;
};

const CoreReactor = () => {
    const { scene } = useGLTF('/models/crystal_bundle.glb');
    return <primitive object={scene} scale={0.04} position={[0, -1, 0]} />;
};

const TracerLine = ({ start, end }: { start: THREE.Vector3; end: THREE.Vector3 }) => {
  const ref = useRef<any>(null);
  const [fireTime, setFireTime] = useState(0);

  useEffect(() => {
    const delay = Math.random() * 5000;
    setTimeout(() => setFireTime(Date.now()), delay);
  }, []);

  useFrame(() => {
    if (ref.current) {
      const elapsedTime = (Date.now() - fireTime) / 500.0;
      if (elapsedTime <= 1.0) {
        ref.current.geometry.setDrawRange(0, Math.floor(elapsedTime * 20));
        ref.current.material.opacity = (1.0 - elapsedTime) * 0.8;
      } else {
        ref.current.material.opacity = 0.0;
        if(elapsedTime > 3.0 + Math.random() * 4.0) {
          setFireTime(Date.now());
        }
      }
    }
  });

  const points = useMemo(() => new THREE.CatmullRomCurve3([start, end]).getPoints(20), [start, end]);
  
  return (
    <line ref={ref}>
        <bufferGeometry attach="geometry" onUpdate={(self) => self.setFromPoints(points)} />
        <lineBasicMaterial attach="material" color="#FFFFFF" linewidth={1.0} transparent />
    </line>
  );
};

// No props are needed here anymore.
export const PrecisionEngine = () => {
    const { camera, pointer } = useThree();
    const scrollY = useRef(0);
    const outerGroupRef = useRef<THREE.Group>(null);
    const innerGroupRef = useRef<THREE.Group>(null);

    const shardModelData = [
        { url: '/models/magic_crystals.glb', scale: 0.015 },
        { url: '/models/crystal.glb', scale: 0.8 },       
        { url: '/models/enchanted_crystal.glb', scale: 6.0 },
        { url: '/models/stylized_crystal.glb', scale: 0.8 } 
    ];

    const shardPositions = useMemo(() => {
        const positions = [];
        const radius = 3.5;
        for (let i = 0; i < 15; i++) {
            const phi = Math.acos(-1 + (2 * i) / 15);
            const theta = Math.sqrt(15 * Math.PI) * phi;
            positions.push(new THREE.Vector3(
                radius * Math.cos(theta) * Math.sin(phi),
                radius * Math.sin(theta) * Math.sin(phi),
                radius * Math.cos(phi)
            ));
        }
        return positions;
    }, []);
    
    useEffect(() => {
        const handleScroll = () => { scrollY.current = window.scrollY; };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useFrame((_state, delta) => {
        // Camera Scroll Logic
        const scrollOffset = scrollY.current / (document.body.scrollHeight - window.innerHeight);
        let targetX, targetY, targetZ, rotX, rotY, rotZ;
        if (scrollOffset < 0.25) { targetX = 0; targetY = 0; targetZ = 8; rotX = 0; rotY = 0; rotZ = 0; }
        else if (scrollOffset < 0.5) { targetX = 3; targetY = -0.5; targetZ = 8; rotX = 0; rotY = -0.4; rotZ = 0; }
        else if (scrollOffset < 0.75) { targetX = -3; targetY = 0; targetZ = 8; rotX = 0; rotY = 0.4; rotZ = 0; }
        else { targetX = 0; targetY = 10; targetZ = 0.1; rotX = -Math.PI / 2; rotY = 0; rotZ = 0; }
        camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 4, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 4, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 4, delta);
        camera.rotation.x = THREE.MathUtils.damp(camera.rotation.x, rotX, 4, delta);
        camera.rotation.y = THREE.MathUtils.damp(camera.rotation.y, rotY, 4, delta);
        camera.rotation.z = THREE.MathUtils.damp(camera.rotation.z, rotZ, 4, delta);

        // --- THE CORRECTED ANIMATION LOGIC ---
        // 1. The OUTER group handles the constant auto-rotation.
        if (outerGroupRef.current) {
            outerGroupRef.current.rotation.y += delta / 30;
        }
        // 2. The INNER group handles the mouse-driven parallax.
        if (innerGroupRef.current) {
            const targetRotX = pointer.y * 0.4;
            const targetRotY = -pointer.x * 0.4;
            innerGroupRef.current.rotation.x = THREE.MathUtils.damp(innerGroupRef.current.rotation.x, targetRotX, 4, delta);
            innerGroupRef.current.rotation.y = THREE.MathUtils.damp(innerGroupRef.current.rotation.y, targetRotY, 4, delta);
        }
    });

    return (
        <group ref={outerGroupRef}>
            <group ref={innerGroupRef}>
                <CoreReactor />
                {shardPositions.map((pos, i) => {
                    const modelData = shardModelData[i % shardModelData.length];
                    return (
                        <CrystalShard 
                            key={i} 
                            initialPosition={pos}
                            modelUrl={modelData.url}
                            scale={modelData.scale}
                        />
                    );
                })}
                {shardPositions.map((pos, i) => (
                    <TracerLine key={`line-${i}`} start={pos} end={new THREE.Vector3(0,0,0)} />
                ))}
            </group>
        </group>
    );
};

// Preload models
useGLTF.preload('/models/crystal_bundle.glb');
useGLTF.preload('/models/crystal.glb');
useGLTF.preload('/models/magic_crystals.glb');
useGLTF.preload('/models/enchanted_crystal.glb');
useGLTF.preload('/models/stylized_crystal.glb');

export default PrecisionEngine;