import React, { useState, useRef } from 'react';

/**
 * Modern 3D Perspective Tilt Card with Dynamic Specular Glare
 * Ingests Awwwards / Apple / Stripe 3D spatial interactive principles.
 */
export const Tilt3DCard = ({ 
  children, 
  className = '', 
  maxTilt = 6.5, 
  scale = 1.02,
  glareIntensity = 0.22,
  glareColor = 'rgba(212, 175, 55, 0.45)',
  disabled = false
}) => {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });

  const handleMouseMove = (e) => {
    if (disabled || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: 'transform 0.08s ease-out',
      transformStyle: 'preserve-3d',
      willChange: 'transform'
    });

    setGlareStyle({
      opacity: glareIntensity,
      background: `radial-gradient(circle at ${x}px ${y}px, ${glareColor} 0%, rgba(255, 255, 255, 0.05) 45%, rgba(0, 0, 0, 0) 70%)`,
      transition: 'opacity 0.15s ease-out',
    });
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
      transformStyle: 'preserve-3d',
    });
    setGlareStyle({
      opacity: 0,
      transition: 'opacity 0.35s ease-out',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
      {/* Dynamic Specular Glare Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-200"
        style={glareStyle}
      />
    </div>
  );
};

export default Tilt3DCard;
