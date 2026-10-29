import { useEffect, useRef } from 'react';

/**
 * Modern Web Scroll-Reveal Hook using IntersectionObserver
 * Automatically triggers hardware-accelerated fluid entrance animations
 */
export const useScrollReveal = (options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      if (ref.current) ref.current.classList.add('is-revealed');
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('is-revealed');
          if (options.once !== false) {
            observer.unobserve(element);
          }
        } else if (options.once === false) {
          element.classList.remove('is-revealed');
        }
      },
      {
        threshold: options.threshold ?? 0.12,
        rootMargin: options.rootMargin || '0px 0px -40px 0px'
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin, options.once]);

  return ref;
};

export default useScrollReveal;
