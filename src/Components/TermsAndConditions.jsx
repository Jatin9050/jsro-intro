import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-5xl font-bold text-center mb-6">Terms and Conditions</h1>
        <p className="text-center text-zinc-400 mb-12">Effective Date: 10th April 2026</p>
        
        <div className="prose prose-invert max-w-none text-zinc-300 text-lg leading-relaxed space-y-6">
          
          <p>
            Please read these Terms and Conditions (“Terms”) carefully before using the services offered by JSRO (“we,” “us,” or “our”).
            By accessing or using our website, registering for our programs, or interacting with our content, you agree to comply 
            with and be bound by these Terms.
          </p>

          <div>
            <h2>1. Eligibility</h2>
            <p>
              Our services are intended for students, parents, educators, and institutions interested in STEM education and innovation programs. 
              By registering or submitting a form, you confirm that you are at least 18 years old, or you are a parent/guardian acting on behalf of a minor.
            </p>
          </div>

          <div>
            <h2>2. Program Enrollment</h2>
            <p>
              Enrollment in workshops, training programs, or labs is subject to availability and eligibility criteria. 
              JSRO reserves the right to approve, modify, or reject any registration or application without prior notice.
            </p>
          </div>

          <div>
            <h2>3. Payments and Refunds</h2>
            <ul>
              <li>All payments made for programs or services must be completed through approved payment methods.</li>
              <li>Fee structures, if applicable, will be communicated prior to enrollment.</li>
              <li>Fees once paid are non-refundable, except in cases where programs are canceled by JSRO.</li>
            </ul>
          </div>

          <div>
            <h2>4. Code of Conduct</h2>
            <p>
              Participants are expected to maintain respectful behavior toward instructors, peers, and staff during any session or interaction. 
              We reserve the right to suspend or terminate access in cases of misconduct without any refund.
            </p>
          </div>

          <div>
            <h2>5. Intellectual Property</h2>
            <p>
              All content provided during programs—including materials, presentations, videos, and tools—are the intellectual property of JSRO 
              and may not be copied, shared, or reused without written permission.
            </p>
          </div>

          <div>
            <h2>6. Limitation of Liability</h2>
            <p>
              JSRO is not liable for any personal injury, data loss, or indirect damages that may occur during participation in our programs 
              or use of our services. Users join programs voluntarily and at their own risk.
            </p>
          </div>

          <div>
            <h2>7. Privacy and Data Use</h2>
            <p>
              All personal data collected is handled in accordance with our Privacy Policy. By using our services, 
              you consent to the collection and use of your data as outlined therein.
            </p>
          </div>

          <div>
            <h2>8. Changes to Terms</h2>
            <p>
              We reserve the right to modify or update these Terms at any time. The latest version will be published on our website 
              with the effective date. Continued use of our services implies acceptance of the updated Terms.
            </p>
          </div>

          <div>
            <h2>9. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising shall be subject 
              to the exclusive jurisdiction of the courts located in [Insert City, State].
            </p>
          </div>

          <div>
            <h2>Contact Us</h2>
            <p>For any questions regarding these Terms and Conditions, please contact:</p>
            <p>
              <strong>JSRO</strong><br />
              📧 info@jsro.in
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;