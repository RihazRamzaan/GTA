import { eventContent } from '../../data/eventContent.js';
import useEventSettings from '../../hooks/useEventSettings.js';

export default function Logo({ className = '' }) {
  const { settings } = useEventSettings();
  const name = settings?.event?.name || eventContent.name;
  const midpoint = Math.ceil(name.length / 2);
  return (
    <span className={`font-display text-xl font-black tracking-wider text-white sm:text-2xl ${className}`}>
      {name.slice(0, midpoint)}
      <span className="text-neon-pink">{name.slice(midpoint)}</span>
    </span>
  );
}
