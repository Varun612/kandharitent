import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * 3D Twilight Venue Grounds & Landscape for Dwarka Shri Lawn
 * Lush manicured lawn, red-carpet pathway, perimeter warm lanterns,
 * distant grand entrance gate, and atmospheric banquet tables.
 */
export const LawnGround = () => {
  // Perimeter lantern post coordinates
  const lanternPosts = useMemo(() => {
    const posts = [];
    const radius = 18;
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      posts.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius
      });
    }
    return posts;
  }, []);

  // Banquet tables positioned around the lawn perimeter
  const banquetTables = useMemo(() => [
    { x: -9, z: -7 },
    { x: -12, z: 2 },
    { x: -8, z: 9 },
    { x: 9, z: -7 },
    { x: 12, z: 2 },
    { x: 8, z: 9 }
  ], []);

  return (
    <group>
      {/* 1. Main Manicured Lawn Ground (Twilight deep emerald green) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial 
          color="#162E1C" 
          roughness={0.9} 
          metalness={0.05} 
        />
      </mesh>

      {/* Subtle Circular Highlight on central event lawn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[22, 48]} />
        <meshStandardMaterial 
          color="#1B3822" 
          roughness={0.8} 
          metalness={0.05} 
        />
      </mesh>

      {/* 2. Red Carpet Aisle / Royal Walkway leading from Entrance to Mandap */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 10]} receiveShadow>
        <planeGeometry args={[2.4, 18]} />
        <meshStandardMaterial color="#6B142F" roughness={0.7} />
      </mesh>

      {/* Gold Fringe along the walkway borders */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.25, 0.03, 10]}>
        <planeGeometry args={[0.08, 18]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.25, 0.03, 10]}>
        <planeGeometry args={[0.08, 18]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 3. Grand Entrance Welcome Gate (at z = 19) */}
      <group position={[0, 0, 19]}>
        {/* Left & Right Gate Pillars */}
        {[-3.2, 3.2].map((x, i) => (
          <group key={`gate-p-${i}`} position={[x, 0, 0]}>
            <mesh position={[0, 2.5, 0]}>
              <boxGeometry args={[0.9, 5, 0.9]} />
              <meshStandardMaterial color="#FAF7F2" roughness={0.4} />
            </mesh>
            <mesh position={[0, 5.15, 0]}>
              <boxGeometry args={[1.2, 0.3, 1.2]} />
              <meshStandardMaterial color="#C5A059" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Hanging Lantern on Gate */}
            <mesh position={[i === 0 ? 0.6 : -0.6, 4.2, 0]}>
              <octahedronGeometry args={[0.25, 0]} />
              <meshStandardMaterial color="#FFB830" emissive="#FFAE42" emissiveIntensity={1.5} />
            </mesh>
            <pointLight position={[i === 0 ? 0.6 : -0.6, 4.2, 0]} color="#FFAE42" intensity={1.5} distance={6} decay={2} />
          </group>
        ))}

        {/* Arch Header over Gate */}
        <mesh position={[0, 5.3, 0]}>
          <boxGeometry args={[7.3, 0.45, 0.9]} />
          <meshStandardMaterial color="#4A0E2E" roughness={0.5} />
        </mesh>
        <mesh position={[0, 5.75, 0]}>
          <cylinderGeometry args={[2.5, 2.5, 0.5, 16, 1, false, 0, Math.PI]} rotation={[0, 0, -Math.PI / 2]} />
          <meshStandardMaterial color="#C5A059" metalness={0.7} roughness={0.25} />
        </mesh>

        {/* Welcome Floral Arch Garlands */}
        <mesh position={[0, 4.9, 0]}>
          <torusGeometry args={[2.8, 0.15, 8, 24, Math.PI]} rotation={[0, 0, Math.PI]} />
          <meshStandardMaterial color="#FF9F1C" roughness={0.6} />
        </mesh>
      </group>

      {/* 4. Perimeter Garden Lanterns */}
      {lanternPosts.map((post, idx) => (
        <group key={`lantern-${idx}`} position={[post.x, 0, post.z]}>
          {/* Post */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 2.4, 8]} />
            <meshStandardMaterial color="#2A081B" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Lantern Head */}
          <mesh position={[0, 2.45, 0]}>
            <octahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial 
              color="#FFE4A0" 
              emissive="#FFAE42" 
              emissiveIntensity={1.4} 
            />
          </mesh>
          <pointLight position={[0, 2.45, 0]} color="#FFAE42" intensity={0.6} distance={6} decay={2} />
        </group>
      ))}

      {/* 5. Round Banquet Tables with Champagne Linens and Floral Centerpieces */}
      {banquetTables.map((tbl, idx) => (
        <group key={`table-${idx}`} position={[tbl.x, 0, tbl.z]}>
          {/* Table Base & Linen */}
          <mesh position={[0, 0.45, 0]} receiveShadow>
            <cylinderGeometry args={[1.3, 1.3, 0.9, 20]} />
            <meshStandardMaterial color="#FAF7F2" roughness={0.6} />
          </mesh>
          {/* Table Top Accent Runner */}
          <mesh position={[0, 0.91, 0]}>
            <cylinderGeometry args={[1.32, 1.32, 0.02, 20]} />
            <meshStandardMaterial color="#C5A059" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Mini Candle Lantern on Table */}
          <mesh position={[0, 1.05, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.22, 8]} />
            <meshStandardMaterial color="#FFAE42" emissive="#FF9F1C" emissiveIntensity={1.8} />
          </mesh>
          <pointLight position={[0, 1.15, 0]} color="#FFAE42" intensity={0.45} distance={3.5} decay={2} />
        </group>
      ))}
    </group>
  );
};

export default LawnGround;
