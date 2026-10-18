import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Atmospheric golden dust, twilight fireflies, and subtle floral motes
 * Floating gently in 3D space around the venue
 */
export const AtmosphericParticles = ({ count = 350 }) => {
  const pointsRef = useRef();

  const [positions, scales, speeds, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scl = new Float32Array(count);
    const spd = new Float32Array(count);
    const phs = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spread across the venue lawn and canopy
      pos[i * 3 + 0] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = Math.random() * 12 + 0.2; // Height from ground to canopy
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;

      scl[i] = Math.random() * 0.12 + 0.04;
      spd[i] = Math.random() * 0.4 + 0.2;
      phs[i] = Math.random() * Math.PI * 2;
    }

    return [pos, scl, spd, phs];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const pos = pointsRef.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Gentle floating harmonic motion
      pos[idx + 1] += Math.sin(time * speeds[i] + phases[i]) * 0.008;
      pos[idx + 0] += Math.cos(time * speeds[i] * 0.5 + phases[i]) * 0.004;
      
      // Keep inside bounds
      if (pos[idx + 1] > 14) pos[idx + 1] = 0.5;
      if (pos[idx + 1] < 0.2) pos[idx + 1] = 13.5;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  // Soft circular particle texture created procedurally
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 235, 175, 1)');
    grad.addColorStop(0.3, 'rgba(218, 165, 32, 0.8)');
    grad.addColorStop(0.7, 'rgba(197, 160, 89, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.22}
        map={particleTexture}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#F5E6CA"
        opacity={0.85}
      />
    </points>
  );
};

export default AtmosphericParticles;
