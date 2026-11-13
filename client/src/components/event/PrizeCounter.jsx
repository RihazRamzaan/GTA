import { useEffect, useRef } from 'react';

export default function PrizeCounter({ total }) {
  const valueRef = useRef(null);
  useEffect(() => {
    const node = valueRef.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const formatted = total.toLocaleString('en-GB');
    let frame = 0;
    const finish = () => { cancelAnimationFrame(frame); node.textContent = formatted; };
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      if (motion.matches) { finish(); return; }
      const start = performance.now();
      const tick = time => {
        const progress = Math.min(1, (time - start) / 1600);
        node.textContent = Math.round(total * (1 - (1 - progress) ** 3)).toLocaleString('en-GB');
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      node.textContent = '0';
      frame = requestAnimationFrame(tick);
    }, { threshold: .5 });
    observer.observe(node);
    motion.addEventListener('change', finish);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      motion.removeEventListener('change', finish);
    };
  }, [total]);
  return <><span className="sr-only">{total.toLocaleString('en-GB')}</span><span className="prize-counter" aria-hidden="true" ref={valueRef}>{total.toLocaleString('en-GB')}</span></>;
}
