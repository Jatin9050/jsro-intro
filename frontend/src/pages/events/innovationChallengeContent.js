/*
 * Copy for the JSRO Innovation Challenge 2026, taken from the client's
 * "Website Content & Developer Brief".
 *
 * Two things the brief asks for that are deliberately NOT published here:
 *   - Prize amounts. The brief marks them "suggested" and notes they go live
 *     only once the prize pool and sponsors are confirmed.
 *   - Timeline dates. Every milestone is still [DATE] in the brief.
 * Both render as "to be announced" instead of being invented.
 */

export const FEE = '₹100';

export const hero = {
  headline: 'Your idea can become the next innovation.',
  sub:
    'Think, build, innovate. Present your solution to a real-world problem and compete with young innovators through the JSRO Innovation Challenge 2026.',
  facts: [
    { label: 'Entry', value: FEE },
    { label: 'Format', value: 'Online' },
    { label: 'Open to', value: 'School & college students' },
  ],
  trust: 'Run by JSRO — robotics, AI, IoT and innovation.',
};

export const about = [
  'The JSRO Innovation Challenge 2026 is an online competition that gives students and young innovators a platform to identify real-world problems and propose technology-driven solutions. You can enter alone or as a team, with an original idea, concept, prototype, simulation or working project.',
  'It rewards practical thinking across robotics, artificial intelligence, IoT, electronics, sustainability, healthcare, smart cities, aerospace and other emerging technologies.',
];

/* `slug` must match the CHECK constraint on project_submissions.category. */
export const categories = [
  { slug: 'robotics-automation', name: 'Robotics & automation', detail: 'Robots, autonomous systems, assistive machines and automation.' },
  { slug: 'artificial-intelligence', name: 'Artificial intelligence', detail: 'AI and ML concepts, intelligent systems, computer vision and applied AI.' },
  { slug: 'iot-smart-systems', name: 'IoT & smart systems', detail: 'Connected devices, sensors, monitoring and smart solutions.' },
  { slug: 'space-aerospace', name: 'Space & aerospace', detail: 'Space technology, satellites, CanSat concepts, aerospace and exploration.' },
  { slug: 'sustainability-environment', name: 'Sustainability & environment', detail: 'Clean technology, waste, water, climate and environmental solutions.' },
  { slug: 'healthcare-technology', name: 'Healthcare technology', detail: 'Assistive technology, monitoring, safety and healthcare innovation.' },
  { slug: 'smart-city', name: 'Smart city', detail: 'Transport, public safety, infrastructure and urban technology.' },
  { slug: 'energy-electronics', name: 'Energy & electronics', detail: 'Energy efficiency, renewable energy, electronics and embedded systems.' },
];

/* A genuine sequence, so these carry numbers. */
export const steps = [
  { title: 'Register', detail: `Complete the online registration and pay the ${FEE} entry fee.` },
  { title: 'Choose a problem', detail: 'Identify a real-world problem inside one of the categories.' },
  { title: 'Create your solution', detail: 'Develop an idea, design, prototype, simulation or working model.' },
  { title: 'Submit', detail: 'Upload your project information before the submission deadline.' },
  { title: 'Evaluation', detail: 'Entries are reviewed against the published judging criteria.' },
  { title: 'Finalists', detail: 'Selected participants may be invited to pitch their project online.' },
  { title: 'Results', detail: 'Winners and finalists are announced on official JSRO channels.' },
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
  { title: 'Show your idea', detail: 'Put your solution in front of a wider innovation community.' },
  { title: 'Compete from anywhere', detail: 'Everything runs online, so there is nothing to travel to.' },
  { title: 'Build your portfolio', detail: 'Turn the project into a documented innovation achievement.' },
  { title: 'Get recognised', detail: 'Winners and finalists receive certificates and recognition.' },
  { title: 'Sharpen your craft', detail: 'Develop problem-solving, presentation and technical communication.' },
  { title: 'Go further', detail: 'Strong projects may be considered for future JSRO programmes.' },
];

export const submission = {
  items: [
    'Project title',
    'Participant or team details',
    'Problem statement',
    'Proposed solution',
    'What makes it original',
    'Technology and components used',
    'Working principle or methodology',
    'Expected impact',
    'Photos, CAD, circuit diagrams, simulation screenshots or prototype video where they apply',
  ],
  note: 'A 2–5 page PDF, plus an optional 3–5 minute demonstration or pitch video.',
};

export const eligibility = [
  'Open to school and college students.',
  'Enter individually or as a team.',
  'Recommended team size is 1–4 participants.',
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

export const timeline = [
  'Registration opens',
  'Registration closes',
  'Submission deadline',
  'Shortlisting',
  'Final presentation',
  'Winners announced',
];

/* Structure only. Amounts stay unpublished until JSRO confirms the prize pool. */
export const prizes = [
  { place: 'First', award: 'Trophy and certificate' },
  { place: 'Second', award: 'Certificate' },
  { place: 'Third', award: 'Certificate' },
  { place: 'Special awards', award: 'Best innovation, best student project, best presentation' },
  { place: 'Finalists', award: 'Finalist certificate' },
  { place: 'Everyone who completes', award: 'Certificate of participation' },
];

export const faqs = [
  { q: 'Who can take part?', a: 'School and college students, and young innovators who meet the final eligibility criteria.' },
  { q: 'Is the whole thing online?', a: 'Registration and the initial project submission are online. Shortlisted participants will be told what the final presentation involves.' },
  { q: 'What does it cost?', a: `The entry fee is ${FEE}.` },
  { q: 'Can I enter on my own?', a: 'Yes. Individual entries are supported, and team entries may also be allowed.' },
  { q: 'Do I need a physical prototype?', a: 'Not necessarily. Ideas, simulations and designs can be accepted, depending on the submission requirements.' },
  { q: 'Can I use Arduino, ESP32 or Raspberry Pi?', a: 'Yes. Choose whatever hardware and software suits your solution.' },
  { q: 'Will I get a certificate?', a: 'Participants who complete the required process can receive a digital participation certificate. Finalist and winner certificates are issued separately.' },
  { q: 'How are winners chosen?', a: 'Entries are scored against the published judging criteria.' },
  { q: 'Can I submit a project I have already built?', a: 'Existing projects may be allowed if you clearly explain your own contribution and how it was developed. Final rules will say whether previously awarded projects qualify.' },
];
