# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Students exploring hands-on technology learning, their parents or guardians, educators, and institutions considering a workshop or program.

## Product Purpose

JSRO presents robotics, artificial intelligence, IoT, drone technology, 3D printing, and space-science learning opportunities. The website helps visitors understand the organization, explore its programs and services, and begin a conversation or event-registration journey.

## Positioning

JSRO connects practical, build-led technology education with programs, workshops, kits, and research-and-development services.

## Operating Context

Visitors arrive on a marketing homepage, often on mobile, before choosing an event, requesting a workshop, submitting a project, contacting JSRO, or downloading a brochure.

## Capabilities and Constraints

- The React application uses Create React App, react-router-dom for routing, Lucide icons, anime.js, and Supabase form submissions.
- The JSRO name and `public/logojsro.jpeg` logo must remain.
- Routing is real: every page has a route, old URLs from the previous site redirect to their current equivalents, and unknown paths reach a 404.
- Organisation facts live in `src/data/site.js` and the three events in `src/data/events.js`. Nothing is hard-coded into a component.
- Razorpay is not integrated. Fees are quoted on request until it is; `fee` stays null in the event data and renders as a contact link.
- Event details beyond those carried over require confirmation; do not fabricate them.

## Brand Commitments

JSRO is a robotics-focused organization. The user requested a complete visual reset for the homepage, a 3D animated experience, and no emoji-led interface. The homepage first shipped on a light theme; the user then asked for a dark one, and it now runs on a warm graphite ground. Remaining surfaces still carry the older dark-neon styling and are not yet on this system.

## Evidence on Hand

- Existing logo: `public/logojsro.jpeg`
- Existing brochure: `public/JSRO_Brochure.pdf`
- Existing homepage and program copy in `src/App.js`
- Existing program detail component in `src/Components/AIRoboticsBootcamp.jsx`
- No verified testimonials, outcomes, pricing, photography, or payment integration are available for the new homepage.

## Product Principles

- Make hands-on learning feel concrete, not abstract.
- Let visitors quickly find the relevant next step.
- Use verified program language and avoid unsupported outcomes or metrics.
- Keep the experience readable and usable on mobile.

## Accessibility & Inclusion

Build for keyboard navigation, visible focus, reduced-motion preferences, semantic landmarks, and WCAG AA colour contrast.
