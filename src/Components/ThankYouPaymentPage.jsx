export function ThankYouPaymentPage({ eventName }) {
  const handlePayment = () => {
    alert("✅ Redirecting to secure payment gateway...\n\n(Payment integration can be added here)");
    // You can integrate Razorpay, Stripe, PayU, etc. here later
    // Example: window.location.href = `/payment?event=${encodeURIComponent(eventName)}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-lg w-full overflow-hidden text-center">
        
        {/* Success Icon */}
        <div className="pt-10 pb-6">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-6xl shadow-lg shadow-green-500/30">
            🎉
          </div>
        </div>

        <div className="px-8 pb-8">
          <h2 className="text-4xl font-bold mb-3">Thank You, for registering in {eventName ? eventName.split(' ').slice(0,2).join(' ') : 'Student'}!</h2>
          
          <p className="text-xl text-zinc-300 mb-2">
            Proceed to Secure Payment For
          </p>
          <p className="text-2xl font-semibold text-cyan-400 mb-8">
            {eventName || "the event"}
          </p>

          <div className="bg-zinc-800/70 border border-zinc-700 rounded-2xl p-6 mb-8 text-left">
            <p className="text-zinc-400 text-sm leading-relaxed">
              We have received your registration details successfully.<br /><br />
              Please proceed with the payment to confirm your seat.
            </p>
          </div>

          <button
            onClick={handlePayment}
            className="w-full py-5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-black font-bold text-xl rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-purple-500/40 flex items-center justify-center gap-3"
          >
            💰 Pay Now
          </button>

          <p className="text-xs text-zinc-500 mt-6">
            Secure payment powered by _____<br />
            You will receive a confirmation email after payment
          </p>
        </div>
      </div>
    </div>
  );
}