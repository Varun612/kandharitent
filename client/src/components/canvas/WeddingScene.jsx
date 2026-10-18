import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import MandapModel from './MandapModel';
import FairyLightCanopy from './FairyLightCanopy';
import LawnGround from './LawnGround';
import AtmosphericParticles from './AtmosphericParticles';
import CameraController from './CameraController';
import InteractiveHotspots from './InteractiveHotspots';
import { Sparkles, Eye, RotateCcw, Compass, MapPin } from 'lucide-react';

/**
 * Main 3D Twilight Wedding Venue Experience
 * Renders the 3D scene of Dwarka Shri Lawn, Royal Mandap, and fairy light canopies
 */
export const WeddingScene = ({ onOpenHotspotDetail }) => {
  const [currentView, setCurrentView] = useState('cinematic');
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [hasWebGLError, setHasWebGLError] = useState(false);

  // Viewpoint Navigation List
  const viewpoints = [
    { id: 'cinematic', label: 'Grand Vista' },
    { id: 'mandap', label: 'Royal Mandap' },
    { id: 'canopy', label: 'Fairy Canopy' },
    { id: 'entrance', label: 'Welcome Arch' },
    { id: 'lawn', label: 'Lawn Panoramic' }
  ];

  if (hasWebGLError) {
    return (
      <div className="relative w-full h-[85vh] royal-gradient flex items-center justify-center text-white p-6">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: `url('/media/rich-decor/IMG_3962.JPG')` }}
        />
        <div className="relative text-center max-w-lg space-y-4">
          <Sparkles className="w-10 h-10 text-brand-gold mx-auto" />
          <h2 className="text-2xl font-serif font-bold">Twilight Wedding Experience</h2>
          <p className="text-xs text-neutral-300">
            Dwarka Shri Lawn & Kandhari Tent & Caterers, Kanpur Road, Lucknow.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[88vh] bg-brand-twilight overflow-hidden select-none">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 3.8, 14], fov: 48, near: 0.1, far: 120 }}
        shadows
        gl={{ 
          antialias: true, 
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          powerPreference: 'high-performance'
        }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color('#0A0212');
          scene.fog = new THREE.FogExp2('#140520', 0.022);
        }}
        onError={() => setHasWebGLError(true)}
      >
        <Suspense fallback={null}>
          {/* Ambient & Directional Moonlight */}
          <ambientLight color="#25143A" intensity={0.7} />
          
          <directionalLight
            position={[10, 20, 8]}
            color="#9AB5E8"
            intensity={1.2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />

          {/* Golden Warm Rim Lighting */}
          <directionalLight position={[-12, 10, -10]} color="#D4AF37" intensity={0.6} />

          {/* 3D Scene Components */}
          <MandapModel position={[0, 0, 0]} />
          <FairyLightCanopy />
          <LawnGround />
          <AtmosphericParticles count={320} />

          {/* 3D Interactive Hotspots */}
          <InteractiveHotspots 
            onSelectView={(viewId) => setCurrentView(viewId)}
            onOpenDetail={onOpenHotspotDetail}
          />

          {/* Camera Animation Controller */}
          <CameraController 
            currentView={currentView} 
            enableMouseParallax={!isOrbiting} 
          />

          {/* Free Orbit Controls for user interactive exploration */}
          <OrbitControls
            enableDamping
            dampingFactor={0.06}
            maxPolarAngle={Math.PI / 2 - 0.05} // Do not dip below ground
            minDistance={3.5}
            maxDistance={32}
            onStart={() => setIsOrbiting(true)}
            onEnd={() => setIsOrbiting(false)}
          />
        </Suspense>
      </Canvas>

      {/* Floating 3D Interaction HUD & Viewpoint Controls */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-dark/80 backdrop-blur-md border border-brand-gold/30 text-brand-goldLight text-xs font-semibold shadow-luxury">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Interactive 3D Twilight Venue</span>
        </div>
        <p className="text-[11px] text-neutral-300/80 mt-1.5 drop-shadow-sm font-sans flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-brand-gold" />
          <span>Drag to orbit • Scroll to zoom • Click pins to inspect</span>
        </p>
      </div>

      {/* Viewpoint Quick Switcher (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 bg-brand-dark/85 backdrop-blur-md rounded-2xl border border-brand-gold/35 shadow-luxury">
        {viewpoints.map((vp) => (
          <button
            key={vp.id}
            onClick={() => setCurrentView(vp.id)}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              currentView === vp.id
                ? 'bg-brand-primary text-brand-goldLight shadow-sm ring-1 ring-brand-gold/50'
                : 'text-neutral-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-brand-gold" />
            <span className="hidden sm:inline">{vp.label}</span>
          </button>
        ))}

        <button
          onClick={() => setCurrentView('cinematic')}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition ml-1"
          title="Reset Camera"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default WeddingScene;
