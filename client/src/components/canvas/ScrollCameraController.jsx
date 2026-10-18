import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Cinematic scroll keyframe path: [Position, Target]
const SCENE_KEYFRAMES = [
  // Scene 1: The Grand Celebration (Wide establishing perspective)
  {
    pos: new THREE.Vector3(0, 4.5, 16.5),
    target: new THREE.Vector3(0, 2.4, 0)
  },
  // Scene 2: Enter the Venue (Gliding along the red-carpet walkway)
  {
    pos: new THREE.Vector3(0, 2.9, 9.5),
    target: new THREE.Vector3(0, 2.2, 0)
  },
  // Scene 3: The Wedding Stage (Intimate focus on mandap, garlands, and sacred flame)
  {
    pos: new THREE.Vector3(0, 1.9, 5.2),
    target: new THREE.Vector3(0, 2.1, 0)
  },
  // Scene 4: Panoramic Lawn & Banquets (Elevated vista of the manicured grounds)
  {
    pos: new THREE.Vector3(10.5, 5.8, 10.5),
    target: new THREE.Vector3(0, 1.8, 0)
  }
];

/**
 * Camera controller smoothly interpolating between cinematic keyframes
 * based on scroll progress or active scene index, with gentle pointer parallax
 */
export const ScrollCameraController = ({ 
  scrollProgress = 0, 
  activeScene = 0, 
  isInteractive = false 
}) => {
  const { camera } = useThree();
  const currentTarget = useRef(new THREE.Vector3(0, 2.4, 0));
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
    if (isInteractive) return; // Allow OrbitControls to take over during manual 360 inspection

    // Map scroll progress (0 to 1) across the 4 keyframes
    const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
    const segmentCount = SCENE_KEYFRAMES.length - 1;
    const scaledProgress = clampedProgress * segmentCount;
    const startIndex = Math.min(Math.floor(scaledProgress), segmentCount - 1);
    const endIndex = startIndex + 1;
    const segmentT = scaledProgress - startIndex;

    // Smooth cubic easing between keyframes
    const smoothT = segmentT * segmentT * (3 - 2 * segmentT);

    const startKF = SCENE_KEYFRAMES[startIndex];
    const endKF = SCENE_KEYFRAMES[endIndex];

    const targetPos = new THREE.Vector3().lerpVectors(startKF.pos, endKF.pos, smoothT);
    const lookTarget = new THREE.Vector3().lerpVectors(startKF.target, endKF.target, smoothT);

    // Subtle pointer parallax
    targetPos.x += mousePos.current.x * 0.45;
    targetPos.y += -mousePos.current.y * 0.25;

    const lerpSpeed = Math.min(delta * 3.5, 0.12);
    camera.position.lerp(targetPos, lerpSpeed);
    currentTarget.current.lerp(lookTarget, lerpSpeed);
    camera.lookAt(currentTarget.current);
  });

  return null;
};

export default ScrollCameraController;
