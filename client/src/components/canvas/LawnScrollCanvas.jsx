import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import MandapModel from './MandapModel';
import FairyLightCanopy from './FairyLightCanopy';
import LawnGround from './LawnGround';
import AtmosphericParticles from './AtmosphericParticles';
import ScrollCameraController from './ScrollCameraController';
import InteractiveHotspots from './InteractiveHotspots';
import { Sparkles, Eye, RotateCcw, Compass, Move3d } from 'lucide-react';

export const LawnScrollCanvas = ({ 
  scrollProgress = 0, 
  activeScene = 0,
  onSelectScene,
  onOpenHotspotDetail 
}) => {
  const [isInspecting, setIsInspecting] = useState(false);
  const [hasWebGLError, setHasWebGLError] = useState(false);

  const scenes = [
    { id: 0, label: 'Grand Celebration', progress: 0.05 },
    { id: 1, label: 'Enter the Venue', progress: 0.38 },
    { id: 2, label: 'The Wedding Stage', progress: 0.70 },
    { id: 3, label: 'Panoramic Grounds', progress: 1.0 }
  ];

  if (hasWebGLError) {
    return (
      <div className="relative w-full h-[75vh] royal-gradient flex items-center justify-center text-white p-6">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: `url('/media/lawns/lawn-main.jpg')` }}
        />
        <div className="relative text-center max-w-lg space-y-3 z-10">
          <Sparkles className="w-10 h-10 text-brand-gold mx-auto" />
          <h2 className="text-2xl font-serif font-bold">Dwarka Shri Lawn</h2>
          <p className="text-xs text-neutral-300">
            Kanpur Road, Opp. Pillar No. 37, Daroga Kheda, Lucknow.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[78vh] sm:h-[84vh] bg-brand-twilight overflow-hidden select-none">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 4.5, 16.5], fov: 48, near: 0.1, far: 120 }}
        shadows
        gl={{ 
          antialias: true, 
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.18,
          powerPreference: 'high-performance'
        }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color('#0A0212');
          scene.fog = new THREE.FogExp2('#140520', 0.022);
        }}
        onError={() => setHasWebGLError(true)}
      >
        <Suspense fallback={null}>
          {/* Ambient Twilight & Directional Moonlight */}
          <ambientLight color="#25143A" intensity={0.72} />
          
          <directionalLight
            position={[10, 20, 8]}
            color="#9AB5E8"
            intensity={1.25}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          {/* Golden Warm Accent Lighting */}
          <directionalLight position={[-12, 10, -10]} color="#D4AF37" intensity={0.65} />

          {/* 3D Venue Elements */}
          <MandapModel position={[0, 0, 0]} />
          <FairyLightCanopy />
          <LawnGround />
          <AtmosphericParticles count={320} />

          {/* 3D Hotspot Pins */}
          <InteractiveHotspots 
            onSelectView={(view) => {
              if (view === 'mandap' && onSelectScene) onSelectScene(2);
              else if (view === 'entrance' && onSelectScene) onSelectScene(1);
              else if (view === 'lawn' && onSelectScene) onSelectScene(3);
            }}
            onOpenDetail={onOpenHotspotDetail}
          />

          {/* Scroll-Driven Smooth Camera Controller */}
          <ScrollCameraController 
            scrollProgress={scrollProgress} 
            activeScene={activeScene}
            isInteractive={isInspecting} 
          />

          {/* 360 Inspection Orbit Controls (Active when user clicks Inspect) */}
          <OrbitControls
            enabled={isInspecting}
            enableDamping
            dampingFactor={0.06}
            maxPolarAngle={Math.PI / 2 - 0.05}
            minDistance={3.5}
            maxDistance={30}
          />
        </Suspense>
      </Canvas>

      {/* Floating HUD: Scene Indicator & Controls */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-dark/85 backdrop-blur-md border border-brand-gold/35 text-brand-goldLight text-xs font-semibold shadow-luxury">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Cinematic Venue Journey</span>
        </div>
        <p className="text-[11px] text-neutral-300/80 mt-1.5 font-sans flex items-center gap-1 drop-shadow-sm">
          <Compass className="w-3.5 h-3.5 text-brand-gold" />
          <span>Scroll to travel through the venue • Or jump to scenes below</span>
        </p>
      </div>

      {/* 360 Inspection Toggle (Top Right) */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <button
          onClick={() => setIsInspecting(!isInspecting)}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-2 shadow-luxury ${
            isInspecting
              ? 'bg-brand-gold text-brand-dark ring-2 ring-brand-gold'
              : 'bg-brand-dark/85 backdrop-blur-md border border-brand-gold/40 text-brand-goldLight hover:bg-brand-primary'
          }`}
          title="Toggle free 360 rotation"
        >
          <Move3d className="w-4 h-4" />
          <span>{isInspecting ? 'Free Orbit Active' : 'Inspect 360°'}</span>
        </button>

        {isInspecting && (
          <button
            onClick={() => setIsInspecting(false)}
            className="p-2 rounded-xl bg-brand-dark/85 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition shadow-luxury"
            title="Return to scroll journey"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Scene Navigation Strip (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 bg-brand-dark/85 backdrop-blur-md rounded-2xl border border-brand-gold/35 shadow-luxury">
        {scenes.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setIsInspecting(false);
              if (onSelectScene) onSelectScene(s.id, s.progress);
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              activeScene === s.id
                ? 'bg-brand-primary text-brand-goldLight shadow-sm ring-1 ring-brand-gold/50'
                : 'text-neutral-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-brand-gold" />
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LawnScrollCanvas;
