import RegisterButton from './RegisterButton.jsx';
import Icon from '../ui/Icon.jsx';
import heroCity from '../../assets/hero-city.png';
import { eventContent } from '../../data/eventContent.js';
import RegistrationNotice from './RegistrationNotice.jsx';
import useEventSettings from '../../hooks/useEventSettings.js';
import { formatColomboDateRange } from '../../utils/dates.js';

const lineColors = ['text-white', 'text-neon-cyan', 'text-neon-pink'];

export default function Hero() {
  const { label, heroLines, tagline, info } = eventContent;
  const { status, settings } = useEventSettings();
  const dateRange =
    status === 'ready'
      ? formatColomboDateRange(settings.milestones?.buildingStartsAt, settings.milestones?.submissionClosesAt)
      : null;
  const dateText = (dateRange || info.dates).toUpperCase();
  const infoItems = [
    { icon: 'calendar', value: dateText, caption: 'EVENT DATES' },
    { icon: 'pin', value: info.venue, caption: 'VENUE' },
    { icon: 'users', value: info.teamSize, caption: 'TEAM SIZE' },
  ];

  return (
    <section
      id="home"
      className="relative flex min-h-[calc(100vh-60px)] flex-col justify-between overflow-hidden bg-night"
    >
      <img
        src={heroCity}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right"
      />
      {/* Dark layer on the left so the headline stays easy to read */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-night via-night/70 to-transparent" />
      {/* Soft fade at the bottom so the info row is easy to read */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night/90 to-transparent" />
      {/* Darker cover on phones, where the text sits over the bright part of the picture */}
      <div className="pointer-events-none absolute inset-0 bg-night/60 md:hidden" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-4 pt-6 pb-6 md:px-8 md:pt-7 md:pb-8">
        <div>
          <p className="mb-2 font-body text-sm font-bold tracking-[0.3em] text-neon-pink">{label}</p>

          <h1 className="font-display font-black leading-[0.92]">
            {heroLines.map((line, i) => (
              <span key={line} className={`block text-5xl sm:text-6xl md:text-7xl lg:text-8xl ${lineColors[i]}`}>
                {line}
              </span>
            ))}
          </h1>

          <p className="mt-5 max-w-md font-body text-lg text-slate-200 md:text-xl">{tagline}</p>

          <div className="mt-6 flex flex-wrap gap-4 md:mt-8">
            <RegisterButton arrow className="px-7 py-3 text-lg" />
            <a
              href="/#about"
              className="rounded border border-neon-pink px-7 py-3 font-body text-lg font-bold text-neon-pink transition hover:bg-neon-pink/10"
            >
              Learn More
            </a>
          </div>
          <RegistrationNotice />
        </div>

        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 md:mt-12">
          {infoItems.map((item) => (
            <div key={item.caption} className="flex items-center gap-3">
              <Icon name={item.icon} size={30} className="text-neon-pink" />
              <div>
                <p className="font-body text-base font-bold text-white md:text-lg">{item.value}</p>
                <p className="font-body text-xs tracking-widest text-slate-400">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
