import React from "react";

const AboutUs = () => {
  return (
    <section className="bg-black text-white py-16 px-6 md:px-20">
      <div className="max-w-6xl mx-auto text-center">
        
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-6">
          About JSRO 🚀
        </h2>

        {/* Tagline */}
        <p className="text-lg md:text-xl text-gray-300 mb-10">
          Building the Future with AI & Robotics
        </p>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-10 text-left">
          
          {/* Left Side */}
          <div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              Who We Are
            </h3>
            <p className="text-gray-400 leading-relaxed">
              JSRO is a modern robotics 
              and AI learning platform focused on empowering students with 
              real-world skills. We aim to make advanced technology accessible 
              and practical for everyone.
            </p>
          </div>

          {/* Right Side */}
          <div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              What We Do
            </h3>
            <ul className="text-gray-400 space-y-3">
              <li>🤖 Robotics Bootcamps & Workshops</li>
              <li>🧠 AI & Technology Training</li>
              <li>🏆 Competitions & Innovation Events</li>
              <li>📦 Robotics Kits & Products</li>
            </ul>
          </div>
        </div>

        {/* Mission */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold text-cyan-400 mb-4">
            Our Mission
          </h3>
          <p className="text-gray-400 max-w-3xl mx-auto">
            To inspire and train the next generation of engineers, innovators, 
            and creators by providing hands-on experience in AI, robotics, and 
            future technologies.
          </p>
        </div>

        {/* Founder */}
        <div className="mt-12">
          <p className="text-gray-500">
            Founded by <span className="text-white font-semibold">Jatin Sangwan</span>  
            <br />
            <span className="text-sm">Founder & Mentor, JSRO</span>
          </p>
        </div>

      </div>
    </section>
  );
};

export default AboutUs;