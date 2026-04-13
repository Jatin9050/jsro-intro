import React from 'react';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-5xl font-bold text-center mb-6">Refund Policy</h1>
        <p className="text-center text-zinc-400 mb-12">Effective Date: 16th August 2015</p>
        
        <div className="prose prose-invert max-w-none text-zinc-300 text-lg leading-relaxed space-y-6">

          <p>
            At JSRO, we strive to deliver high-quality educational experiences through our STEM programs, 
            workshops, and competitions. This Refund Policy outlines the conditions under which refunds may or may not be issued.
          </p>

          <div>
            <h2>1. Non-Refundable Fees</h2>
            <p>Unless otherwise stated in writing, all program fees paid are non-refundable, including:</p>
            <ul>
              <li>Registration fees</li>
              <li>Workshop or Competition participation fees</li>
              <li>Customized learning kit charges</li>
              <li>Any advance payments made for booking or material procurement</li>
            </ul>
          </div>

          <div>
            <h2>2. Program Cancellation by JSRO</h2>
            <p>
              In the unlikely event that a program, workshop, or session is canceled by JSRO due to unforeseen circumstances 
              (such as minimum enrollment not met, scheduling conflicts, or operational issues), participants will be eligible for:
            </p>
            <ul>
              <li>A full refund of the program fee, or</li>
              <li>The option to transfer the fee to another upcoming session or program</li>
            </ul>
          </div>

          <div>
            <h2>3. Participant Withdrawal</h2>
            <p>If a participant chooses to withdraw from a program after registration, the following applies:</p>
            <ul>
              <li>No refund will be issued for voluntary withdrawals or no-shows</li>
              <li>
                Requests for exceptions due to medical or personal emergencies will be considered on a case-by-case basis, 
                and must be submitted in writing with relevant documentation
              </li>
            </ul>
          </div>

          <div>
            <h2>4. Refund Process</h2>
            <ul>
              <li>All approved refunds will be processed within 7–14 business days via the original mode of payment</li>
              <li>
                JSRO reserves the right to deduct applicable processing charges or material costs 
                (if kits/resources were already issued)
              </li>
            </ul>
          </div>

          <div>
            <h2>5. How to Request a Refund</h2>
            <p>To initiate a refund request (if applicable), please contact us at:</p>
            <p>
              📧 Info@jsro.in<br />
              📞 +91-9306647832
            </p>
            <p>
              Include your name, program details, payment reference, and reason for the request.
            </p>
          </div>

          <div>
            <h2>6. Changes to This Policy</h2>
            <p>
              JSRO reserves the right to modify or update this Refund Policy at any time. 
              Changes will be reflected on our official platforms with the updated effective date.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;