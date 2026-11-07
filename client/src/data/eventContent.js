// Public event copy belongs to Yuwandhi. Keep this file as the shared content boundary.
// NOTE: Everything marked PLACEHOLDER must be replaced with the real wording from the supervisor.
import sponsor1 from '../assets/sponsors/sponsor-1.svg';
import sponsor2 from '../assets/sponsors/sponsor-2.svg';
import sponsor3 from '../assets/sponsors/sponsor-3.svg';
import sponsor4 from '../assets/sponsors/sponsor-4.svg';

export const eventContent = {
    name: 'Cyberpunk',
  logo: { first: 'CYBER', second: 'PUNK' },
  label: 'GAME BUILDATHON',
  heroLines: ['CREATE', 'PLAY', 'BEYOND'],
  tagline: 'A 48-hour game development buildathon for dreamers, builders and gamers.',

  // PLACEHOLDER: real dates should come from the supervisor / API
  info: {
    dates: 'DATES TO BE ANNOUNCED',
    venue: 'COLOMBO, SRI LANKA',
    teamSize: 'TEAMS OF 2 – 4',
  },

  navLinks: [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Timeline', href: '#timeline' },
    { label: 'Prizes', href: '#prizes' },
    { label: 'Rules', href: '#rules' },
    { label: 'Sponsors', href: '#sponsors' },
    { label: 'FAQ', href: '#faq' },
  ],

  about: {
    title: 'BUILD GAMES',
    highlight: 'THAT MATTER',
    text: 'Cyberpunk is a game development buildathon bringing together creators, designers and developers to build innovative games, learn, and showcase their talent.',
    cards: [
      { title: 'Innovate', text: 'Bring your ideas to life' },
      { title: 'Collaborate', text: 'Work with amazing people' },
      { title: 'Showcase', text: 'Present your game to industry experts' },
      { title: 'Win Prizes', text: 'Get recognized and rewarded' },
    ],
  },

  // Labels are fixed here. The DATES come from the API (milestones).
    agendaSteps: [
    { key: 'registrationOpensAt', label: 'Registration Opens', countdownTitle: 'Registration opens in' },
    { key: 'registrationClosesAt', label: 'Registration Closes', countdownTitle: 'Registration closes in' },
    { key: 'buildingStartsAt', label: 'Building Starts', countdownTitle: 'Building starts in' },
    { key: 'submissionOpensAt', label: 'Submissions Open', countdownTitle: 'Submissions open in' },
    { key: 'submissionClosesAt', label: 'Submissions Close', countdownTitle: 'Submissions close in' },
    { key: 'resultsAt', label: 'Results', countdownTitle: 'Results in' },
  ],

  // PLACEHOLDER amounts from the design mockup
  prizes: [
    { place: '1st Place', amount: 'LKR 150,000', color: 'gold', perks: ['Cash Prize', 'Mentorship Opportunity', 'Goodies & Certificates'] },
    { place: '2nd Place', amount: 'LKR 100,000', color: 'silver', perks: ['Cash Prize', 'Mentorship Opportunity', 'Goodies & Certificates'] },
    { place: '3rd Place', amount: 'LKR 50,000', color: 'bronze', perks: ['Cash Prize', 'Mentorship Opportunity', 'Goodies & Certificates'] },
  ],

  // PLACEHOLDER sponsors
  sponsors: [
    { name: 'Sponsor One', logo: sponsor1 },
    { name: 'Sponsor Two', logo: sponsor2 },
    { name: 'Sponsor Three', logo: sponsor3 },
    { name: 'Sponsor Four', logo: sponsor4 },
  ],

  // PLACEHOLDER rules
  rules: [
    'Teams must have 2 – 4 members.',
    'Open to all university students.',
    'The game idea must be original.',
    'Any game engine or framework is allowed.',
    'All work must be created during the event.',
  ],

  // PLACEHOLDER FAQ
  faq: [
    { q: 'Who can join?', a: 'Any university student can join in a team of 2 – 4 members.' },
    { q: 'How do I register?', a: 'Click Register Now, create a team account and upload your payment slip.' },
    { q: 'What do I need to submit?', a: 'A title, a description, your repository link, a playable link and an optional video link.' },
    { q: 'Do I need a game engine?', a: 'No. You can use any engine, framework or language you like.' },
  ],
};