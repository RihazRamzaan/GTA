// Public event copy belongs to Yuwandhi. Keep this file as the shared content boundary.
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

  // Fallback info when settings are loading or offline (matches saved milestone dates)
  info: {
    dates: '16 NOV – 10 DEC 2026',
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

  // Approved prize pool
  prizes: [
    { place: '1st Place', amount: 'LKR 150,000', color: 'gold', perks: ['Cash Prize', 'Mentorship Opportunity', 'Goodies & Official Certificates'] },
    { place: '2nd Place', amount: 'LKR 100,000', color: 'silver', perks: ['Cash Prize', 'Mentorship Opportunity', 'Goodies & Official Certificates'] },
    { place: '3rd Place', amount: 'LKR 50,000', color: 'bronze', perks: ['Cash Prize', 'Mentorship Opportunity', 'Goodies & Official Certificates'] },
  ],

  // Official event partners & sponsors
  sponsors: [
    { name: 'Sponsor One', logo: sponsor1 },
    { name: 'Sponsor Two', logo: sponsor2 },
    { name: 'Sponsor Three', logo: sponsor3 },
    { name: 'Sponsor Four', logo: sponsor4 },
  ],

  // Approved Hackathon Guidelines (Day 7 complete specification)
  rules: [
    {
      title: 'Eligibility & Team Size',
      text: 'Open to all currently enrolled undergraduate university students. Teams must consist of 2 to 4 members. Individual entry is not permitted, and each participant may only belong to one team.',
      tag: 'Eligibility',
    },
    {
      title: 'Original Work',
      text: 'All game projects must be original works conceived and built during the buildathon window (16 Nov – 10 Dec 2026). Pre-existing games or codebases developed prior to the event are strictly prohibited.',
      tag: 'Originality',
    },
    {
      title: 'Allowed Engines & Frameworks',
      text: 'Any game development engine, framework, or programming language is permitted (e.g., Unity, Unreal Engine, Godot, Phaser, WebGL, Pygame, or custom engines). Both 2D and 3D games are welcome.',
      tag: 'Technology',
    },
    {
      title: 'Asset Licensing & Fair Use',
      text: 'Third-party assets (sprites, 3D models, audio, fonts) may be used provided they are legally licensed (CC0, Creative Commons with attribution, public domain, or open source). All third-party assets must be credited in the repository README.',
      tag: 'Licensing',
    },
    {
      title: 'AI & Tool Usage Policy',
      text: 'AI development assistance tools (such as GitHub Copilot, ChatGPT, or AI concept art) may be used to assist programming and brainstorming. However, core game logic and creative direction must be authored by the team, and AI tool usage must be disclosed.',
      tag: 'AI Policy',
    },
    {
      title: 'Submission Requirements',
      text: 'Every team must submit their game title, a concise gameplay description, and a valid public GitHub repository link containing full source code. Playable web builds and video gameplay demo links are completely optional.',
      tag: 'Submission',
    },
    {
      title: 'Judging Criteria',
      text: 'Entries will be evaluated by an industry panel based on Gameplay & Fun (30%), Innovation & Originality (25%), Visual & Sound Design (25%), and Theme Interpretation & Technical Execution (20%).',
      tag: 'Judging',
    },
    {
      title: 'Code of Conduct & Fair Play',
      text: 'All participants must maintain sportsmanship and respect fellow competitors, mentors, and judges. Plagiarism, harassment, offensive themes, or disrespectful conduct will result in immediate disqualification.',
      tag: 'Conduct',
    },
  ],

  // Participant FAQ (Day 7 Free Registration & Submission rules)
  faq: [
    {
      q: 'Is there an entry fee?',
      a: 'No. Registration is 100% free for all eligible teams. There are no registration fees, bank deposits, or payment slip uploads required.',
    },
    {
      q: 'Who can join the buildathon?',
      a: 'Any currently enrolled university student can participate in a team of 2 to 4 members. Cross-faculty and cross-university teams are welcome.',
    },
    {
      q: 'How do I register our team?',
      a: 'Click "Register Now", enter your team leader details, add your team members, and create your account. Your team registration is confirmed automatically as soon as you submit.',
    },
    {
      q: 'What do we need to submit at the end?',
      a: 'Your team only needs to provide your game title, a short gameplay description, and a link to your public GitHub repository. A playable build URL and a gameplay video link are completely optional.',
    },
    {
      q: 'What game engines or tools are allowed?',
      a: 'You can use any game engine, framework, or programming language you like, including Unity, Unreal Engine, Godot, Phaser, WebGL, Pygame, or custom code.',
    },
    {
      q: 'Can we change our team members after registering?',
      a: 'Yes. Team leaders can edit team members from the team dashboard up until registration closes. Once registration closes, rosters are locked.',
    },
    {
      q: 'Can we use pre-made assets or AI tools?',
      a: 'Yes, freely licensed open-source assets and audio (CC0, CC-BY) are permitted with attribution. AI coding and concept tools are also allowed to assist your workflow, as long as the core game design is your own.',
    },
  ],
};
