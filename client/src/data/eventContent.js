// Public event copy belongs to Yuwandhi. Keep this file as the shared content boundary.
import sponsor1 from '../assets/sponsors/sponsor-1.svg';
import sponsor2 from '../assets/sponsors/sponsor-2.svg';
import sponsor3 from '../assets/sponsors/sponsor-3.svg';
import sponsor4 from '../assets/sponsors/sponsor-4.svg';

export const eventContent = {
  name: 'GAMORA',
  logo: { first: 'GAM', second: 'ORA' },
  label: 'GAMING BUILDATHON & INTERACTIVE EXPO',
  heroLines: ['IMAGINE', 'BUILD', 'UNLEASH'],
  tagline: "Sri Lanka's premier multiplayer game development buildathon and interactive gaming expo.",

  // Fallback info when settings are loading or offline (matches official proposal dates & venue)
  info: {
    dates: '13 NOV – 17 DEC 2026',
    venue: 'DHARMALOKA HALL, UOK',
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
    title: 'IMAGINE & BUILD',
    highlight: 'UNLEASH GAMING',
    text: 'Organized collaboratively by the Software Engineering Students’ Association (SESA) and the IEEE Student Branch of the University of Kelaniya (IEEE SB UOK), GAMORA bridges academic rigor with high-growth industry disciplines: networked systems, real-time multiplayer synchronization, artificial intelligence, and interactive entertainment.',
    cards: [
      { title: 'Multiplayer Systems', text: 'Authoritative synchronization & low-latency replication' },
      { title: 'Game AI Systems', text: 'Custom NPC behaviors, decision trees & adaptive algorithms' },
      { title: 'Interactive Expo', text: 'Public Gaming Zone & Grand Finale stage at Dharmaloka Hall' },
      { title: 'LKR 150K Prize Pool', text: '100% locked & ring-fenced core cash prizes and trophies' },
    ],
  },

  // Labels are fixed here. The dynamic dates come from the API (milestones).
  agendaSteps: [
    { key: 'registrationOpensAt', label: 'Registration Opens', countdownTitle: 'Registration opens in' },
    { key: 'registrationClosesAt', label: 'Registration Closes', countdownTitle: 'Registration closes in' },
    { key: 'buildingStartsAt', label: 'Round 1 Begins', countdownTitle: 'Round 1 starts in' },
    { key: 'submissionOpensAt', label: 'Submissions Open', countdownTitle: 'Submissions open in' },
    { key: 'submissionClosesAt', label: 'Round 1 Deadline', countdownTitle: 'Round 1 closes in' },
    { key: 'resultsAt', label: 'Grand Finale & Expo', countdownTitle: 'Grand Finale in' },
  ],

  // Approved core prize pool from official proposal (LKR 150,000 total core pool)
  prizes: [
    {
      place: '1st Place',
      amount: 'LKR 75,000',
      color: 'gold',
      perks: [
        'Cash Prize + Official Trophy',
        'Main Stage Finalist Demo',
        'Industry Mentorship & Certificates',
      ],
    },
    {
      place: '2nd Place',
      amount: 'LKR 50,000',
      color: 'silver',
      perks: [
        'Cash Prize + Official Trophy',
        'Interactive Expo Showcase',
        'Industry Mentorship & Certificates',
      ],
    },
    {
      place: '3rd Place',
      amount: 'LKR 25,000',
      color: 'bronze',
      perks: [
        'Cash Prize + Official Trophy',
        'Interactive Expo Showcase',
        'Industry Mentorship & Certificates',
      ],
    },
  ],

  // Official Partnership Tiers from Proposal
  sponsors: [
    { name: 'Title Partner', logo: sponsor1 },
    { name: 'Gold Partner', logo: sponsor2 },
    { name: 'Silver Partner', logo: sponsor3 },
    { name: 'Bronze Partner', logo: sponsor4 },
  ],

  // Approved Hackathon Guidelines & Technical Scope Rubric
  rules: [
    {
      title: 'Eligibility & Team Size',
      text: 'Open to all currently enrolled undergraduate university students nationwide. Teams must consist of 2 to 4 members. Cross-faculty and cross-university teams are welcome, but each participant may only belong to one team.',
      tag: 'Eligibility',
    },
    {
      title: 'Original Multiplayer Game Work',
      text: 'All game projects must be original works developed during the buildathon window (Nov 29 – Dec 10, 2026). Pre-existing games or source code created prior to topic release are strictly prohibited.',
      tag: 'Originality',
    },
    {
      title: 'Allowed Engines & Frameworks',
      text: 'Any game development engine, framework, or programming language is permitted (Unity, Unreal Engine, Godot, Phaser, WebGL, Pygame, or custom engines). Both 2D and 3D multiplayer games are eligible.',
      tag: 'Technology',
    },
    {
      title: 'Technical Evaluation Rubric',
      text: 'Projects will be judged on Multiplayer Replication & Network Reliability, Game AI Systems, Architecture & Software Engineering, UX/UI & Polish, and Deployment & Packaging.',
      tag: 'Rubric',
    },
    {
      title: 'Asset Licensing & Fair Use',
      text: 'Third-party assets (sprites, 3D models, audio, fonts) may be used provided they are legally licensed (CC0, Creative Commons with attribution, public domain, or open-source) and credited in your repository README.',
      tag: 'Licensing',
    },
    {
      title: 'AI & Tool Usage Policy',
      text: 'AI development assistance (such as GitHub Copilot, ChatGPT, or Midjourney) is permitted to support brainstorming and code assistance. Core gameplay logic and creative direction must be authored by the team and disclosed.',
      tag: 'AI Policy',
    },
    {
      title: 'Submission Requirements',
      text: 'Every team must submit their game title, short description, and a link to a public GitHub repository. Playable build links and gameplay demonstration video links are completely optional.',
      tag: 'Submission',
    },
    {
      title: 'Code of Conduct & Fair Play',
      text: 'All participants must maintain sportsmanship and respect fellow competitors, mentors, and judges. Plagiarism, harassment, offensive content, or unsportsmanlike behavior will result in immediate disqualification.',
      tag: 'Conduct',
    },
  ],

  // Participant FAQ (Free Registration, Event Roadmap, and Grand Finale Details)
  faq: [
    {
      q: 'Is there an entry fee for GAMORA?',
      a: 'No. Registration is 100% free for all eligible university teams. There are no registration fees, bank deposits, or payment slip uploads required.',
    },
    {
      q: 'Who is organizing GAMORA?',
      a: 'GAMORA is organized collaboratively by the Software Engineering Students’ Association (SESA) and the IEEE Student Branch of the University of Kelaniya (IEEE SB UOK).',
    },
    {
      q: 'Where and when does the Grand Finale take place?',
      a: 'The Grand Finale & Interactive Gaming Expo will take place on Thursday, December 17, 2026, from 9:00 AM to 5:00 PM at Dharmaloka Hall, University of Kelaniya.',
    },
    {
      q: 'How does team registration work?',
      a: 'Click "Register Now", enter your team leader details, add your team members (2 to 4 members), and submit. Your registration is confirmed automatically without manual verification.',
    },
    {
      q: 'What do we need to submit for Round 1?',
      a: 'Your team only needs to provide your game title, a short description, and a link to your public GitHub repository. A playable build URL and a gameplay video link are completely optional.',
    },
    {
      q: 'How will games be evaluated?',
      a: 'Projects will be evaluated by an industry panel based on 5 core criteria: Multiplayer Replication & Network Reliability, Game AI Systems, Software Architecture, UX/UI Polish, and Packaging.',
    },
    {
      q: 'How are finalists selected?',
      a: 'The Top 06 finalist teams will be announced on December 13, 2026, and will advance to Round 2 to showcase their games live on stage and in the public Gaming Zone at Dharmaloka Hall.',
    },
    {
      q: 'Can we change our team members after registering?',
      a: 'Yes. Team leaders can edit team members from the team dashboard up until registration closes on November 27, 2026. After that deadline, rosters are locked.',
    },
  ],

  // Official Organizer Contacts
  contact: {
    sesaEmail: 'sesa.uok@gmail.com',
    ieeeEmail: 'ieeesl.uok@gmail.com',
    website: 'https://www.sesa.lk',
    venue: 'Dharmaloka Hall, University of Kelaniya',
  },
};
