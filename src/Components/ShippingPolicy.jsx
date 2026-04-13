import React from 'react';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-5xl font-bold text-center mb-6">Shipping Policy</h1>
        <p className="text-center text-zinc-400 mb-12">Last Updated: 10 April 2026</p>
        
        <div className="prose prose-invert max-w-none text-zinc-300 text-lg leading-relaxed space-y-6">

          <div>
            <h2>Order Processing</h2>
            <p>
              All orders are processed within 1–3 business days after successful payment confirmation.
              Orders are not shipped on Sundays or public holidays.
            </p>
          </div>

          <div>
            <h2>Delivery Time</h2>
            <ul>
              <li>Standard Delivery: 3–7 business days</li>
              <li>Express Delivery: 1–3 business days (if available)</li>
            </ul>
            <p>Delivery timelines may vary depending on your location.</p>
          </div>

          <div>
            <h2>Shipping Charges</h2>
            <ul>
              <li>Free shipping on orders above ₹999</li>
              <li>₹50–₹100 shipping charge on orders below ₹999</li>
            </ul>
          </div>

          <div>
            <h2>Shipping Coverage</h2>
            <p>We currently ship across India only. International shipping is not available at this time.</p>
          </div>

          <div>
            <h2>Order Tracking</h2>
            <p>
              Once your order is shipped, you will receive a tracking link via WhatsApp or Email.
            </p>
          </div>

          <div>
            <h2>Delays</h2>
            <p>Delivery delays may occur due to:</p>
            <ul>
              <li>Courier partner issues</li>
              <li>Weather conditions</li>
              <li>High order volume</li>
            </ul>
            <p>
              JSRO is not responsible for delays caused by third-party courier services.
            </p>
          </div>

          <div>
            <h2>Damaged or Missing Orders</h2>
            <p>If your order arrives damaged or is missing:</p>
            <ul>
              <li>Contact us within 48 hours of delivery</li>
              <li>Share clear photo/video proof</li>
            </ul>
            <p>We will provide a replacement or suitable resolution.</p>
          </div>

          <div>
            <h2>Incorrect Address</h2>
            <p>
              Please ensure your shipping details are correct.
              JSRO is not responsible for delivery issues due to incorrect addresses provided by the customer.
            </p>
          </div>

          <div>
            <h2>Contact Us</h2>
            <p>For any shipping-related queries:</p>
            <p>
              📧 Email: info@jsro.in<br />
              📱 WhatsApp: 9306647832<br />
              🌐 Website: https://jsro.in
            </p>
          </div>

          <p>
            By placing an order with JSRO, you agree to this Shipping Policy.
          </p>

        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;