// Single source of truth for JSRO's organisation facts.
// Everything in the app reads from here — never hard-code a phone number,
// an address or an email into a component again.
//
// Confirmed by JSRO: info@jsro.in is the contact email for every surface, and
// the Anvay Complex address below is the current premises.

export const site = {
  name: 'JSRO',
  legalName: 'Jatin Space & Robotics Organization',
  tagline: 'Be an Innovator',
  brochureTagline: 'Building the Future with AI & Robotics',
  founder: 'Jatin Sangwan',
  founderRole: 'Founder & Mentor, JSRO',

  email: 'info@jsro.in',
  phone: '+917015229749',
  phoneDisplay: '+91 70152 29749',
  // Confirmed by the printed brochure (Brochure.pdf).
  whatsapp: '917988049218',
  website: 'https://jsro.in',
  instagram: 'https://instagram.com/jsro.in',
  instagramHandle: '@jsro.in',

  address: {
    line: '1st Floor, Shop No. 3, Anvay Complex',
    landmark: 'OP Jindal Marg (Near Kia Showroom)',
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
  site.address.landmark,
  site.address.city,
  `${site.address.state} - ${site.address.postcode}`,
].join(', ');

export const whatsappUrl = `https://wa.me/${site.whatsapp}`;
export const mailtoUrl = `mailto:${site.email}`;

export const legalLinks = [
  { label: 'Privacy', to: '/privacy-policy' },
  { label: 'Terms', to: '/terms-and-conditions' },
  { label: 'Refunds', to: '/refund-policy' },
  { label: 'Shipping', to: '/shipping-policy' },
];
