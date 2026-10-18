import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 3D Procedural Indian Wedding Mandap
 * Features 4 carved gold-accented pillars, marigold/jasmine garlands,
 * tiered ornate canopy, champagne drapes, and the sacred ceremonial dais.
 */
export const MandapModel = ({ position = [0, 0, 0] }) => {
  const fireLightRef = useRef();
  const flameRef = useRef();

  // Pillar positions (Square 4.5m x 4.5m footprint)
  const pillarOffsets = useMemo(() => [
    { x: -2.25, z: -2.25 },
    { x: 2.25, z: -2.25 },
    { x: -2.25, z: 2.25 },
    { x: 2.25, z: 2.25 }
  ], []);

  // Soft flicker animation for the sacred ceremonial havan fire
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (fireLightRef.current) {
      fireLightRef.current.intensity = 2.4 + Math.sin(time * 8) * 0.4 + Math.cos(time * 15) * 0.2;
    }
    if (flameRef.current) {
      flameRef.current.scale.y = 1 + Math.sin(time * 10) * 0.15;
      flameRef.current.scale.x = 1 + Math.cos(time * 12) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* 1. Mandap Dais / Raised Podium */}
      {/* Lower Platform (Marble / Ivory stone step) */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[4.2, 4.4, 0.3, 32]} />
        <meshStandardMaterial color="#FAF7F2" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Upper Platform (Royal Velvet Carpet with Gold Trim) */}
      <mesh position={[0, 0.32, 0]} receiveShadow>
        <cylinderGeometry args={[3.8, 3.9, 0.06, 32]} />
        <meshStandardMaterial color="#4A0E2E" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Gold Trim Ring around Platform */}
      <mesh position={[0, 0.33, 0]}>
        <torusGeometry args={[3.85, 0.03, 12, 32]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* 2. Four Royal Carved Pillars */}
      {pillarOffsets.map((p, idx) => (
        <group key={`pillar-${idx}`} position={[p.x, 0.35, p.z]}>
          {/* Base Plinth */}
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.65, 0.4, 0.65]} />
            <meshStandardMaterial color="#C5A059" metalness={0.7} roughness={0.25} />
          </mesh>

          {/* Column Shaft */}
          <mesh position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.22, 0.26, 2.8, 16]} />
            <meshStandardMaterial color="#FDFBF7" roughness={0.3} metalness={0.1} />
          </mesh>

          {/* Carved Gold Rings on Column */}
          {[1.0, 1.8, 2.6].map((ringY, rIdx) => (
            <mesh key={`ring-${rIdx}`} position={[0, ringY, 0]}>
              <torusGeometry args={[0.26, 0.025, 12, 20]} />
              <meshStandardMaterial color="#D4AF37" metalness={0.85} roughness={0.2} />
            </mesh>
          ))}

          {/* Floral Garland wrapped spiraling around the pillar */}
          {Array.from({ length: 14 }).map((_, fIdx) => {
            const t = fIdx / 14;
            const angle = t * Math.PI * 4; // 2 full revolutions
            const r = 0.28;
            const fy = 0.5 + t * 2.5;
            const fx = Math.cos(angle) * r;
            const fz = Math.sin(angle) * r;
            const isMarigold = fIdx % 2 === 0;
            return (
              <mesh key={`garland-${fIdx}`} position={[fx, fy, fz]}>
                <sphereGeometry args={[0.075, 8, 8]} />
                <meshStandardMaterial 
                  color={isMarigold ? '#FF9F1C' : '#FFFDF5'} 
                  roughness={0.6}
                />
              </mesh>
            );
          })}

          {/* Pillar Capital (Top ornate bracket) */}
          <mesh position={[0, 3.3, 0]}>
            <boxGeometry args={[0.65, 0.25, 0.65]} />
            <meshStandardMaterial color="#C5A059" metalness={0.7} roughness={0.25} />
          </mesh>

          {/* Warm base uplight */}
          <pointLight position={[0, 0.5, 0]} color="#FFAE42" intensity={0.8} distance={3.5} decay={2} />
        </group>
      ))}

      {/* 3. Canopy Roof & Cross Beams */}
      <group position={[0, 3.8, 0]}>
        {/* Outer Square Beams */}
        <mesh position={[0, 0, -2.25]}>
          <boxGeometry args={[5.2, 0.22, 0.35]} />
          <meshStandardMaterial color="#3D0C27" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 2.25]}>
          <boxGeometry args={[5.2, 0.22, 0.35]} />
          <meshStandardMaterial color="#3D0C27" roughness={0.5} />
        </mesh>
        <mesh position={[-2.25, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[5.2, 0.22, 0.35]} />
          <meshStandardMaterial color="#3D0C27" roughness={0.5} />
        </mesh>
        <mesh position={[2.25, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[5.2, 0.22, 0.35]} />
          <meshStandardMaterial color="#3D0C27" roughness={0.5} />
        </mesh>

        {/* Ornate Gold Border Trim on Beams */}
        <mesh position={[0, -0.12, 0]}>
          <boxGeometry args={[5.2, 0.03, 5.2]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.85} roughness={0.2} wireframe />
        </mesh>

        {/* Cascading Floral Fringe under Cross Beams */}
        {[-2.2, -1.1, 0, 1.1, 2.2].map((xPos, idx) => (
          <group key={`fringe-${idx}`}>
            <mesh position={[xPos, -0.4, 2.25]}>
              <cylinderGeometry args={[0.04, 0.04, 0.55, 6]} />
              <meshStandardMaterial color="#FF9F1C" roughness={0.6} />
            </mesh>
            <mesh position={[xPos, -0.4, -2.25]}>
              <cylinderGeometry args={[0.04, 0.04, 0.55, 6]} />
              <meshStandardMaterial color="#FF9F1C" roughness={0.6} />
            </mesh>
          </group>
        ))}

        {/* Tiered Domed Roof Canopy (Champagne Fabric with Royal Plum Ribs) */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[1.5, 3.2, 0.9, 16]} />
          <meshStandardMaterial color="#FAF7F2" roughness={0.6} />
        </mesh>

        {/* Gold Kalash / Top Finial */}
        <mesh position={[0, 1.35, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0, 1.7, 0]}>
          <coneGeometry args={[0.15, 0.45, 12]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
        </mesh>
      </group>

      {/* 4. Sacred Center: Havan Kund (Ceremonial Altar) */}
      <group position={[0, 0.35, 0]}>
        {/* Tiered Copper / Brass Havan Kund Altar */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[1.0, 0.16, 1.0]} />
          <meshStandardMaterial color="#B87333" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.8, 0.12, 0.8]} />
          <meshStandardMaterial color="#8C5020" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.6, 0.08, 0.6]} />
          <meshStandardMaterial color="#4A1E00" roughness={0.8} />
        </mesh>

        {/* Ceremonial Flame */}
        <mesh ref={flameRef} position={[0, 0.42, 0]}>
          <coneGeometry args={[0.18, 0.35, 8]} />
          <meshStandardMaterial 
            color="#FF6B1A" 
            emissive="#FFAE42" 
            emissiveIntensity={2} 
            transparent 
            opacity={0.9} 
          />
        </mesh>

        {/* Sacred Fire Light Glow */}
        <pointLight
          ref={fireLightRef}
          position={[0, 0.5, 0]}
          color="#FFAE42"
          intensity={2.8}
          distance={7.5}
          decay={2}
          castShadow
        />
      </group>

      {/* 5. Royal Ceremonial Seating Chowkis (Bajots) */}
      {[-0.9, 0.9].map((zPos, sIdx) => (
        <group key={`seating-${sIdx}`} position={[0, 0.35, zPos]}>
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.85, 0.12, 0.55]} />
            <meshStandardMaterial color="#C5A059" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[0.78, 0.08, 0.48]} />
            <meshStandardMaterial color="#4A0E2E" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default MandapModel;
