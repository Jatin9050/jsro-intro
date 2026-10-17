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
    registrationOpen: false,
    // Held back: not shown in the homepage list, and its page says it opens
    // soon. Remove this line (and the ComingSoon route in App.jsx) to bring
    // the full CanSat page back.
    unlisted: true,
    hasDetailPage: true,
    legacySlugs: ['ai-robotics-bootcamp'],
  },
  {
    id: 'innovation-challenge',
    slug: 'innovation-challenge',
    title: 'JSRO Innovation Challenge 2026',
    shortTitle: 'Innovation Challenge',
    summary:
      'An online competition where students identify a real-world problem and propose a technology-driven solution.',
    // Corrected from the 2026 content brief. The previous values (Delhi NCR,
    // 9:00-17:00, May 30) predate it and described a different, offline event.
    focus: 'Open innovation',
    date: null,          // brief leaves every milestone as [DATE]
    duration: null,
    time: null,
    location: 'Online',
    fee: '\u20B9100',
    registrationOpen: false,
    // The brief's flow ends in a project upload; the other two events do not.
    acceptsSubmissions: true,
    // UI only — the database's event_settings.submissions_open is what enforces it.
    submissionsOpen: false,
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
    registrationOpen: false,
    hasDetailPage: true,
    legacySlugs: ['boochallengetcamp', 'bootcamp'],
  },
];

// The events the homepage shows.
export const listedEvents = events.filter((event) => !event.unlisted);

export const getEvent = (slug) => events.find((event) => event.slug === slug);

export const eventPath = (event) => `/events/${event.slug}`;
export const registerPath = (event) => `/events/${event.slug}/register`;
export const submitPath = (event) => `/events/${event.slug}/submit`;

// Old URL -> current slug, used to build the redirect routes.
export const legacyRedirects = events.flatMap((event) =>
  event.legacySlugs.map((from) => ({ from: `/${from}`, to: eventPath(event) }))
);

export const eventStatusLabel = (event) =>
  event.registrationOpen ? 'Registration open' : 'Coming soon';

// Until pricing is published, the fee line points at JSRO instead of a number.
export const hasPublishedFee = (event) => Boolean(event.fee);
