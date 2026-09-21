// The three JSRO events, in one place. Routes, the homepage list, the
// registration form and the legacy-URL redirects all read from this file.
//
// Fields set to null are NOT yet confirmed by JSRO. They render as
// "To be announced" rather than being invented. Fill them in here.
//
// `fee` stays null on purpose: pricing is quoted on request until Razorpay is
// wired, and a null fee renders as a "contact for fees" link rather than a
// number. Put the real amount here when payment goes live.
//
// `legacySlugs` keeps old links from the live site working — each one
// redirects to the event's current URL instead of 404ing.

export const events = [
  {
    id: 'cansat-program',
    slug: 'cansat-program',
    title: 'CanSat Program',
    shortTitle: 'CanSat Program',
    summary:
      'Design, build, test and launch a real high-altitude balloon satellite to the edge of space.',
    focus: 'Space sciences',
    // Carried over from the previous site. NEEDS CONFIRMATION.
    date: 'May 5, 2026',
    duration: '6–8 months',
    time: null,
    location: 'Offline',
    fee: null,
    registrationOpen: true,
    hasDetailPage: true,
    legacySlugs: ['ai-robotics-bootcamp'],
  },
  {
    id: 'innovation-challenge',
    slug: 'innovation-challenge',
    title: 'Innovation Challenge',
    shortTitle: 'Innovation Challenge',
    summary:
      'A competitive event where student teams design and build automated systems.',
    focus: 'Robotics & automation',
    date: 'May 30, 2026',
    duration: null,
    time: '9:00 AM – 5:00 PM',
    location: 'Delhi NCR',
    fee: null,
    registrationOpen: true,
    hasDetailPage: true,
    legacySlugs: ['workshop'],
  },
  {
    id: 'jrc-2026',
    slug: 'jrc-2026',
    title: 'JRC 2026 — IoT & Computer Vision Challenge',
    shortTitle: 'JRC 2026',
    summary:
      'Learn computer vision and IoT integration in robotics, then compete on it.',
    focus: 'IoT & computer vision',
    date: 'May 22, 2026',
    duration: null,
    time: '11:00 AM – 3:00 PM',
    location: 'Offline',
    fee: null,
    registrationOpen: true,
    hasDetailPage: true,
    legacySlugs: ['boochallengetcamp', 'bootcamp'],
  },
];

export const getEvent = (slug) => events.find((event) => event.slug === slug);

export const eventPath = (event) => `/events/${event.slug}`;
export const registerPath = (event) => `/events/${event.slug}/register`;

// Old URL -> current slug, used to build the redirect routes.
export const legacyRedirects = events.flatMap((event) =>
  event.legacySlugs.map((from) => ({ from: `/${from}`, to: eventPath(event) }))
);

export const eventStatusLabel = (event) =>
  event.registrationOpen ? 'Registration open' : 'Registration opens soon';

// Until pricing is published, the fee line points at JSRO instead of a number.
export const hasPublishedFee = (event) => Boolean(event.fee);
