import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to trigger entrance animations once when an element scrolls into view.
 * Respects prefers-reduced-motion and gracefully falls back if IntersectionObserver is unavailable.
 */
export default function useScrollReveal(options = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -40px 0px' } = options;
  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // If running in SSR, unsupported browser, or reduced motion preferred, reveal immediately
    if (
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsRevealed(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(node); // Animate once, avoid re-triggering during normal scroll
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return [ref, isRevealed];
}
