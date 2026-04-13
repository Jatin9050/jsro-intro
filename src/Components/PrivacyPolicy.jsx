import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-5xl font-bold text-center mb-6">Privacy Policy</h1>
        <p className="text-center text-zinc-400 mb-12">Effective Date: 10th April 2026</p>
        
        <div className="prose prose-invert max-w-none text-zinc-300 text-lg leading-relaxed space-y-6">
          
          <p>
            At JSRO, we are committed to safeguarding the privacy of our users and ensuring the security of personal information. 
            This Privacy Policy outlines how we collect, use, and protect the data you provide when interacting with our platforms, 
            advertisements, or services.
          </p>

          <div>
            <h2>1. Information We Collect</h2>
            <p>We may collect the following personal information when you engage with our lead forms, website, or advertisements:</p>
            <ul>
              <li>Full Name</li>
              <li>Email Address</li>
              <li>Contact Number</li>
              <li>Geographic Location (City and Country)</li>
              <li>Child’s Age or Grade (where applicable)</li>
              <li>Any additional information voluntarily submitted through forms, messages, or inquiries</li>
            </ul>
          </div>

          <div>
            <h2>2. Purpose of Data Collection</h2>
            <p>The information collected is used strictly for legitimate educational and communication purposes, including:</p>
            <ul>
              <li>Providing information about our educational programs, workshops, events, and STEM-related initiatives</li>
              <li>Sharing brochures, registration links, and program updates</li>
              <li>Sending reminders, announcements, promotional offers, and relevant communications</li>
              <li>Enhancing user experience by customizing our offerings based on your interests and feedback</li>
            </ul>
          </div>

          <div>
            <h2>3. Data Sharing and Disclosure</h2>
            <p>We value your trust and are committed to data confidentiality:</p>
            <ul>
              <li>We do not sell, rent, or trade your personal information to third parties.</li>
              <li>
                Data may be shared only with verified internal teams or service providers who support our operations, 
                under strict confidentiality and data protection agreements.
              </li>
            </ul>
          </div>

          <div>
            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to ensure the integrity and confidentiality of your data. 
              While we strive to protect your information, please be aware that no electronic transmission over the internet is entirely secure.
            </p>
          </div>

          <div>
            <h2>5. Your Data Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access, correct, or request deletion of your personal data</li>
              <li>Opt out of receiving promotional communications at any time</li>
            </ul>
            <p>To exercise these rights, please contact us via the details below.</p>
          </div>

          <div>
            <h2>6. Policy Updates</h2>
            <p>
              JSRO reserves the right to update or amend this Privacy Policy as necessary. 
              All revisions will be published on our official platforms with an updated effective date.
            </p>
          </div>

          <div>
            <h2>7. Contact Information</h2>
            <p>For any inquiries or concerns regarding this Privacy Policy, please contact:</p>
            <p>
              <strong>JSRO</strong><br />
              📧 info@jsro.in<br />
              📞 +91-9306647832
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;