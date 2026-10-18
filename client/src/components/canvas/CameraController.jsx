import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const VIEWPOINTS = {
  cinematic: {
    pos: new THREE.Vector3(0, 3.8, 14),
    target: new THREE.Vector3(0, 2.2, 0)
  },
  mandap: {
    pos: new THREE.Vector3(0, 1.8, 5.6),
    target: new THREE.Vector3(0, 2.1, 0)
  },
  canopy: {
    pos: new THREE.Vector3(2.5, 4.2, 3.8),
    target: new THREE.Vector3(0, 7.8, 0)
  },
  entrance: {
    pos: new THREE.Vector3(0, 3.2, 24),
    target: new THREE.Vector3(0, 3.8, 18)
  },
  lawn: {
    pos: new THREE.Vector3(13, 6.5, 13),
    target: new THREE.Vector3(0, 1.8, 0)
  }
};

/**
 * Smooth lerping camera controller with subtle mouse parallax
 */
export const CameraController = ({ currentView = 'cinematic', enableMouseParallax = true }) => {
  const { camera } = useThree();
  const currentTarget = useRef(new THREE.Vector3(0, 2.2, 0));
  const mousePos = useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mousePos.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((_, delta) => {
    const config = VIEWPOINTS[currentView] || VIEWPOINTS.cinematic;
    const lerpSpeed = Math.min(delta * 2.8, 0.1);

    // Desired camera position with subtle parallax offset
    const parallaxX = enableMouseParallax ? mousePos.current.x * 0.6 : 0;
    const parallaxY = enableMouseParallax ? -mousePos.current.y * 0.35 : 0;

    const targetPos = new THREE.Vector3(
      config.pos.x + parallaxX,
      config.pos.y + parallaxY,
      config.pos.z
    );

    camera.position.lerp(targetPos, lerpSpeed);
    currentTarget.current.lerp(config.target, lerpSpeed);
    camera.lookAt(currentTarget.current);
  });

  return null;
};

export default CameraController;
