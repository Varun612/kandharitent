import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 3D Suspended Fairy Light Canopy and Grand Crystal Chandelier
 * Overhead glowing canopy of warm filament bulbs and crystal facets
 */
export const FairyLightCanopy = () => {
  const chandelierRef = useRef();
  const lightsGroupRef = useRef();

  // Create catenary light strings radiating outward from the central chandelier
  const { lightPositions, stringCurves } = useMemo(() => {
    const positions = [];
    const curves = [];
    const stringCount = 12;
    const pointsPerString = 22;
    const centerHeight = 8.5;
    const outerHeight = 5.2;
    const outerRadius = 16;

    for (let s = 0; s < stringCount; s++) {
      const angle = (s / stringCount) * Math.PI * 2;
      const endX = Math.cos(angle) * outerRadius;
      const endZ = Math.sin(angle) * outerRadius;

      // Catenary dip
      const curvePoints = [];
      for (let p = 0; p <= pointsPerString; p++) {
        const t = p / pointsPerString;
        const x = t * endX;
        const z = t * endZ;
        // parabolic catenary dip in height
        const dip = Math.sin(t * Math.PI) * 1.2;
        const y = (1 - t) * centerHeight + t * outerHeight - dip;

        curvePoints.push(new THREE.Vector3(x, y, z));

        // Skip center-most and outer-most points for bulb instances
        if (p > 1 && p < pointsPerString) {
          positions.push(x, y, z);
        }
      }

      const curve = new THREE.CatmullRomCurve3(curvePoints);
      curves.push(curve);
    }

    return {
      lightPositions: new Float32Array(positions),
      stringCurves: curves
    };
  }, []);

  // Subtle breathing oscillation for the warm fairy lights
  useFrame((state) => {
    if (chandelierRef.current) {
      // Very gentle rotation of the central crystal chandelier
      chandelierRef.current.rotation.y = state.clock.getElapsedTime() * 0.04;
    }
  });

  return (
    <group ref={lightsGroupRef}>
      {/* 1. Hanging Wire Lines */}
      {stringCurves.map((curve, idx) => {
        const points = curve.getPoints(30);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <primitive 
            key={`wire-${idx}`} 
            object={new THREE.Line(
              lineGeo, 
              new THREE.LineBasicMaterial({ color: '#3A2E20', transparent: true, opacity: 0.4 })
            )} 
          />
        );
      })}

      {/* 2. Fairy Light Bulbs (Points for high performance and radiant glow) */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={lightPositions.length / 3}
            array={lightPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          color="#FFEAA7"
          emissive="#FFAE42"
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 3. Central Grand Crystal Chandelier */}
      <group ref={chandelierRef} position={[0, 8.2, 0]}>
        {/* Support chain & brass crown */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 1.6, 8]} />
          <meshStandardMaterial color="#C5A059" metalness={0.8} roughness={0.2} />
        </mesh>

        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[0.7, 0.06, 12, 24]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Chandelier Tier 1: Outer Crystal Ring */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const x = Math.cos(a) * 0.7;
          const z = Math.sin(a) * 0.7;
          return (
            <group key={`c-arm-${i}`} position={[x, -0.3, z]}>
              {/* Droplet crystal */}
              <mesh position={[0, -0.25, 0]}>
                <octahedronGeometry args={[0.12, 0]} />
                <meshStandardMaterial
                  color="#FFFDF5"
                  metalness={0.1}
                  roughness={0.05}
                  transmission={0.8}
                  ior={1.5}
                  transparent
                  opacity={0.85}
                />
              </mesh>
            </group>
          );
        })}

        {/* Chandelier Tier 2: Lower Tier */}
        <mesh position={[0, -0.6, 0]}>
          <coneGeometry args={[0.45, 0.6, 6]} />
          <meshStandardMaterial
            color="#FFFFFF"
            metalness={0.1}
            roughness={0.1}
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>

        {/* Central Chandelier Core Glow Light */}
        <pointLight
          position={[0, -0.3, 0]}
          color="#FFE2A0"
          intensity={2.8}
          distance={12}
          decay={2}
        />
      </group>

      {/* Additional ambient warm fill from the fairy light canopy */}
      <pointLight position={[0, 6.5, 0]} color="#FFAE42" intensity={1.5} distance={18} decay={2} />
    </group>
  );
};

export default FairyLightCanopy;
