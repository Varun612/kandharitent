import React from 'react';
import useScrollReveal from '../../hooks/useScrollReveal';

/**
 * ScrollReveal Wrapper Component
 * Animates children into view when scrolled into the viewport.
 */
export const ScrollReveal = ({ 
  children, 
  className = '', 
  delay = 0, 
  direction = 'up',
  once = true 
}) => {
  const ref = useScrollReveal({ once });

  const getDirectionClasses = () => {
    switch (direction) {
      case 'down': return '-translate-y-8';
      case 'left': return 'translate-x-8';
      case 'right': return '-translate-x-8';
      case 'scale': return 'scale-95';
      case 'up':
      default: return 'translate-y-8';
    }
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`scroll-reveal ${getDirectionClasses()} ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
