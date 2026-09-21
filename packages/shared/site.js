// Single source of truth for JSRO's organisation facts.
// Everything in the app reads from here — never hard-code a phone number,
// an address or an email into a component again.
//
// Confirmed by JSRO: jsro.ai@gmail.com (the brochure address) is the contact
// email for every surface. info@jsro.in and info@smartckts.com are retired.
// The phone numbers below are still the ones inherited from the old site and
// have not been confirmed.

export const site = {
  name: 'JSRO',
  legalName: 'Jatin Space & Robotics Organization',
  tagline: 'Be an Innovator',
  brochureTagline: 'Building the Future with AI & Robotics',
  founder: 'Jatin Sangwan',
  founderRole: 'Founder & Mentor, JSRO',

  email: 'jsro.ai@gmail.com',
  phone: '+917015229749',
  phoneDisplay: '+91 70152 29749',
  // Confirmed by the printed brochure (Brochure.pdf).
  whatsapp: '917988049218',
  website: 'https://jsro.in',
  instagram: 'https://instagram.com/jsro.in',
  instagramHandle: '@jsro.in',

  address: {
    line: '168, Adarsh Colony, Hisar Cantt',
    city: 'Hisar',
    state: 'Haryana',
    postcode: '125006',
    country: 'India',
  },

  brochurePath: '/JSRO_Brochure.pdf',
  logoPath: '/logojsro.jpeg',

  // Verified service lines, taken from the brochure.
  services: [
    'AI & Robotics training programmes',
    'Hands-on robotics projects',
    'IoT & embedded systems development',
    'Workshops & bootcamps',
    'Automation solutions',
  ],
};

export const addressOneLine = [
  site.address.line,
  site.address.city,
  site.address.state,
  site.address.postcode,
].join(', ');

export const whatsappUrl = `https://wa.me/${site.whatsapp}`;
export const mailtoUrl = `mailto:${site.email}`;

export const legalLinks = [
  { label: 'Privacy', to: '/privacy-policy' },
  { label: 'Terms', to: '/terms-and-conditions' },
  { label: 'Refunds', to: '/refund-policy' },
  { label: 'Shipping', to: '/shipping-policy' },
];
