/*
 * Copy for the JSRO Innovation Challenge 2026. Written from the client's
 * "Website Content & Developer Brief", then updated from the official
 * competition poster, which confirms the dates, the tracks, who can enter, the
 * prizes and the sponsor. Where the two differ, the poster wins.
 */

export const FEE = '₹100';

export const hero = {
  headline: 'Your idea can become the next innovation.',
  sub:
    'A national-level competition for students and young innovators to build real-world solutions using robotics, AI, space, sustainability and technology. Turn ideas into impact.',
  facts: [
    { label: 'Entry', value: `${FEE} per team` },
    { label: 'Format', value: 'Online' },
    { label: 'First prize', value: '₹10,000' },
  ],
  trust: 'Organised by JSRO. Sponsored by HR20 Car Custom.',
};

export const about = [
  'The JSRO Innovation Challenge 2026 is a national-level competition that gives students and young innovators a platform to identify real-world problems and propose technology-driven solutions. You can enter with an original idea, concept, prototype, simulation or working project.',
  'It rewards practical thinking across robotics and AI, sustainability and the environment, space and aerospace, social impact and smart solutions, hardware and IoT, and any other creative idea with real-world impact.',
];

/* `slug` must match the CHECK constraint on project_submissions.category. */
export const categories = [
  { slug: 'robotics-ai', name: 'Robotics & AI', detail: 'Autonomous systems, AI models and smart robots.' },
  { slug: 'sustainability', name: 'Sustainability', detail: 'Clean energy, agriculture and waste management.' },
  { slug: 'space-aerospace', name: 'Space & aerospace', detail: 'CanSat, drones, space tech and remote sensing.' },
  { slug: 'social-impact', name: 'Social impact', detail: 'Healthcare, education and rural solutions.' },
  { slug: 'open-innovation', name: 'Open innovation', detail: 'Any creative idea with real-world impact.' },
];

/* A genuine sequence, so these carry numbers. */
export const steps = [
  { title: 'Register', detail: `Register and pay the ${FEE} team entry fee together, by 22 Nov 2026.` },
  { title: 'Choose a problem', detail: 'Identify a real-world problem inside one of the five tracks.' },
  { title: 'Create your solution', detail: 'Develop an idea, design, prototype, simulation or working model.' },
  { title: 'Submit', detail: 'Upload your project before the deadline on 20 Dec 2026.' },
  { title: 'Evaluation', detail: 'Entries are reviewed against the published judging criteria.' },
  { title: 'Shortlist', detail: 'The top 100 teams are announced on 30 Dec 2026.' },
  { title: 'Results', detail: 'Winners are announced on 10 Jan 2027 on official JSRO channels.' },
];

/* Weights sum to 100 — the page draws them to scale. */
export const judging = [
  { criterion: 'Innovation & originality', weight: 25 },
  { criterion: 'Problem relevance', weight: 20 },
  { criterion: 'Technical feasibility', weight: 20 },
  { criterion: 'Impact & scalability', weight: 15 },
  { criterion: 'Execution & prototype quality', weight: 10 },
  { criterion: 'Presentation & communication', weight: 10 },
];

export const benefits = [
  { title: 'Win cash prizes', detail: 'The first prize is ₹10,000, and the other top winners receive cash prizes too.' },
  { title: 'Get a certificate', detail: 'Every participant receives a certificate.' },
  { title: 'Meet industry experts', detail: 'Showcase your project to people working in the field.' },
  { title: 'Find a mentor', detail: 'Mentorship and networking opportunities, with internship opportunities for standout teams.' },
  { title: 'Join the network', detail: 'Be part of the JSRO Innovation Network and be featured on the JSRO platform.' },
];

export const submission = {
  items: [
    'Project idea or concept note',
    'A working model or prototype (or a simulation)',
    'A short demo video',
    'A presentation (PPT)',
    'The problem you solve, your solution, what makes it original, the technology used and the expected impact',
  ],
  note: 'Upload your concept note and presentation as one PDF (export your PPT to PDF), and add a link to your short demo video.',
};

export const eligibility = [
  'School students in Class 6 to 12.',
  'College students, undergraduate or diploma.',
  'Young innovators aged 15 to 25.',
  'Enter as a team or on your own. The ₹100 entry fee is per team.',
  'Give accurate name, institution and contact details.',
  'Submit original work, or clearly credit any third-party resources you used.',
];

export const rules = [
  'Projects must be substantially your own work.',
  'Plagiarised or fraudulent submissions may be disqualified.',
  'Publicly available hardware, software and research may be used, with sources acknowledged.',
  'Projects must not intentionally demonstrate unsafe, illegal or harmful activity.',
  'JSRO may ask for clarification or proof of how the project was developed.',
  'Submission deadlines are final unless JSRO announces an extension.',
  'The judges’ decision is final.',
  'JSRO may reject submissions that do not meet the published requirements.',
];

/* From the official poster. */
export const timeline = [
  { milestone: 'Registration opens', date: '20 Oct 2026' },
  { milestone: 'Last date to register', date: '22 Nov 2026' },
  { milestone: 'Project submission deadline', date: '20 Dec 2026' },
  { milestone: 'Shortlisted teams announced (top 100)', date: '30 Dec 2026' },
  { milestone: 'Winners announced', date: '10 Jan 2027' },
];

export const prizes = [
  { place: 'First prize', award: '₹10,000 cash prize' },
  { place: 'Other top winners', award: 'Cash prizes' },
  { place: 'Every participant', award: 'Certificate' },
  { place: 'Standout teams', award: 'Mentorship and internship opportunities' },
  { place: 'Showcase', award: 'Featured on the JSRO platform' },
];

export const faqs = [
  { q: 'Who can take part?', a: 'School students in Class 6 to 12, college students (undergraduate or diploma), and young innovators aged 15 to 25.' },
  { q: 'Is the whole thing online?', a: 'Yes. Registration, payment and project submission are all online. Shortlisted teams will be told if anything more is needed.' },
  { q: 'What does it cost?', a: `The entry fee is ${FEE} per team, paid when you register.` },
  { q: 'When are the deadlines?', a: 'Register by 22 Nov 2026 and submit your project by 20 Dec 2026. The top 100 teams are announced on 30 Dec 2026, and winners on 10 Jan 2027.' },
  { q: 'Can I enter on my own?', a: 'Yes. You can enter alone or as a team.' },
  { q: 'Do I need a physical prototype?', a: 'Not necessarily. Ideas, simulations and designs can be accepted, depending on the submission requirements.' },
  { q: 'Can I use Arduino, ESP32 or Raspberry Pi?', a: 'Yes. Choose whatever hardware and software suits your solution.' },
  { q: 'Will I get a certificate?', a: 'Yes. Every participant receives a certificate.' },
  { q: 'How are winners chosen?', a: 'Entries are scored against the published judging criteria.' },
  { q: 'Can I submit a project I have already built?', a: 'Existing projects may be allowed if you clearly explain your own contribution and how it was developed. Final rules will say whether previously awarded projects qualify.' },
];
