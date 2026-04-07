import React, { useState } from 'react';
import { Menu, X, Rocket, Users, Target, Award } from 'lucide-react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-zinc-950/90 backdrop-blur-md z-50 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">JSRO</h1>
              <p className="text-[10px] text-zinc-500 -mt-1">Robotics Ecosystem</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10 text-sm font-medium">
            <button onClick={() => scrollToSection('vision')} className="hover:text-cyan-400 transition-colors">Vision</button>
            <button onClick={() => scrollToSection('problem')} className="hover:text-cyan-400 transition-colors">Problem</button>
            <button onClick={() => scrollToSection('solution')} className="hover:text-cyan-400 transition-colors">Solution</button>
            <button onClick={() => scrollToSection('product')} className="hover:text-cyan-400 transition-colors">Product</button>
            <button onClick={() => scrollToSection('market')} className="hover:text-cyan-400 transition-colors">Market</button>
            <button onClick={() => scrollToSection('roadmap')} className="hover:text-cyan-400 transition-colors">Roadmap</button>
          </div>

          <button
            onClick={() => scrollToSection('contact')}
            className="hidden md:block px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-cyan-400 hover:text-black transition-all"
          >
            Get In Touch
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-zinc-900 border-t border-zinc-800 py-6">
            <div className="flex flex-col gap-6 px-6 text-lg">
              {['Vision', 'Problem', 'Solution', 'Product', 'Market', 'Roadmap'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="text-left hover:text-cyan-400 transition-colors"
                >
                  {item}
                </button>
              ))}
              <button
                onClick={() => scrollToSection('contact')}
                className="mt-4 px-6 py-3 bg-white text-black font-semibold rounded-full w-fit"
              >
                Contact Us
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_right,#22d3ee_0%,transparent_50%)] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-cyan-500/30 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-cyan-400 text-sm font-medium">Building the Future of Robotics</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-tight mb-6">
            The Next-Gen<br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Robotics Ecosystem
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-zinc-400 mb-10">
            AI-powered robotics modules making advanced automation accessible to students, educators, and industries.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollToSection('product')}
              className="px-10 py-4 bg-white text-black font-semibold rounded-2xl hover:bg-cyan-400 hover:scale-105 transition-all flex items-center gap-3 justify-center"
            >
              Explore Our Products
            </button>
            <button
              onClick={() => scrollToSection('vision')}
              className="px-10 py-4 border border-white/50 hover:border-white font-semibold rounded-2xl transition-all"
            >
              Our Vision
            </button>
          </div>

          <div className="mt-20 flex justify-center">
            <div className="text-xs text-zinc-500 flex items-center gap-8">
              <div>POWERED BY AI • IoT • COMPUTER VISION</div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Our Vision</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              To create an advanced robotics ecosystem that integrates AI, automation, and real-world applications globally.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-800/50 p-8 rounded-3xl border border-zinc-700 hover:border-cyan-400/50 transition-all group">
              <Target className="w-12 h-12 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-semibold mb-3">Global Impact</h3>
              <p className="text-zinc-400">Democratizing robotics education and innovation across education and industry.</p>
            </div>

            <div className="bg-zinc-800/50 p-8 rounded-3xl border border-zinc-700 hover:border-purple-400/50 transition-all group">
              <Users className="w-12 h-12 text-purple-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-semibold mb-3">Empowering Creators</h3>
              <p className="text-zinc-400">Making high-end robotics accessible to students, makers, and professionals.</p>
            </div>

            <div className="bg-zinc-800/50 p-8 rounded-3xl border border-zinc-700 hover:border-pink-400/50 transition-all group">
              <Award className="w-12 h-12 text-pink-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-semibold mb-3">Future Ready</h3>
              <p className="text-zinc-400">Building intelligent systems that solve real-world challenges with AI.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-8">The Challenge</h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-1">✕</div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Lack of Accessible Platforms</h4>
                    <p className="text-zinc-400">Most robotics innovation platforms are either too expensive or too complex for students and small industries.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-1">✕</div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">High Cost Barrier</h4>
                    <p className="text-zinc-400">Advanced robotics systems cost thousands of dollars, making them inaccessible to most learners.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-1">✕</div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Limited Real-World Integration</h4>
                    <p className="text-zinc-400">Few solutions bridge the gap between classroom learning and actual industrial applications.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 p-10 rounded-3xl border border-zinc-700">
              <h3 className="text-3xl font-bold mb-8 text-center">We Are Solving This</h3>
              <div id="solution" className="space-y-6">
                <div className="flex items-start gap-4 bg-zinc-800/70 p-6 rounded-2xl">
                  <div className="text-4xl">🚀</div>
                  <div>
                    <h4 className="font-semibold text-lg">AI-Powered Robotics Modules</h4>
                    <p className="text-zinc-400 mt-1">Affordable, intelligent, and easy to integrate.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-zinc-800/70 p-6 rounded-2xl">
                  <div className="text-4xl">🔌</div>
                  <div>
                    <h4 className="font-semibold text-lg">Raspberry Pi & IoT Integration</h4>
                    <p className="text-zinc-400 mt-1">Seamless connection with modern hardware.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="product" className="py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Our Products</h2>
            <p className="text-zinc-400 text-lg">Cutting-edge robotics solutions for education and industry</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "AI Robotics Modules", desc: "Intelligent plug-and-play modules with built-in AI", icon: "🤖" },
              { name: "Smart Automation Systems", desc: "Fully automated solutions for industrial use", icon: "⚙️" },
              { name: "Raspberry Pi & IoT Kits", desc: "Advanced integration kits with sensors & connectivity", icon: "📡" },
              { name: "Custom Robotics Solutions", desc: "Tailored robots for specific industry needs", icon: "🛠️" },
            ].map((product, i) => (
              <div key={i} className="group bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700 hover:border-cyan-400 rounded-3xl p-8 transition-all duration-300">
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">{product.icon}</div>
                <h3 className="text-2xl font-semibold mb-3">{product.name}</h3>
                <p className="text-zinc-400">{product.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology & Market */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl font-bold mb-10">Core Technology</h2>
              <div className="grid grid-cols-2 gap-6">
                {["Artificial Intelligence", "Machine Learning", "Computer Vision", "Embedded Systems", "IoT Integration"].map((tech, i) => (
                  <div key={i} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-700 hover:border-purple-500 transition-colors">
                    <p className="font-medium">{tech}</p>
                  </div>
                ))}
              </div>
            </div>

            <div id="market">
              <h2 className="text-4xl font-bold mb-10">Market Opportunity</h2>
              <div className="space-y-8 text-lg">
                <p className="text-zinc-300">
                  The global robotics market is growing rapidly, with increasing demand in:
                </p>
                <ul className="space-y-4 text-zinc-400">
                  <li className="flex items-center gap-3">• Education & STEM Learning</li>
                  <li className="flex items-center gap-3">• Healthcare Automation</li>
                  <li className="flex items-center gap-3">• Industrial Manufacturing</li>
                  <li className="flex items-center gap-3">• Smart Homes & IoT</li>
                </ul>
                <div className="pt-6 border-t border-zinc-800">
                  <p className="text-2xl font-semibold text-cyan-400">Be part of the robotics revolution.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-16">Our Roadmap</h2>
          
          <div className="max-w-3xl mx-auto space-y-12">
            {[
              { year: "2026", title: "Prototype & Testing", desc: "Develop core AI robotics modules and conduct extensive field testing" },
              { year: "2027", title: "Market Entry", desc: "Launch first product line and partner with educational institutions" },
              { year: "2028", title: "Global Expansion", desc: "Enter international markets including Japan & Dubai" },
            ].map((item, i) => (
              <div key={i} className="flex gap-8">
                <div className="w-28 flex-shrink-0 text-right">
                  <div className="text-cyan-400 text-4xl font-bold">{item.year}</div>
                </div>
                <div className="flex-1 border-l border-zinc-700 pl-10">
                  <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-24 bg-black border-t border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl flex items-center justify-center text-6xl">
            👨‍🔬
          </div>
          <h2 className="text-4xl font-bold mb-3">Meet Our Founder</h2>
          <p className="text-2xl text-cyan-400 mb-6">Jatin Sangwan</p>
          <p className="text-xl text-zinc-400 max-w-lg mx-auto">
            Robotics Trainer & Innovator<br />
            Passionate about making robotics education accessible to everyone.
          </p>
        </div>
      </section>

      {/* CTA / Contact */}
      <section id="contact" className="py-28 bg-gradient-to-b from-zinc-900 to-black">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-6">Let's Build the Future Together</h2>
          <p className="text-xl text-zinc-400 mb-12">
            Whether you're an educator, student, institution, or industry partner — we're ready to collaborate.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:contact@jsro.in" className="px-12 py-5 bg-white text-black font-semibold text-lg rounded-2xl hover:bg-cyan-400 transition-all">
              Contact Us
            </a>
            <button className="px-12 py-5 border border-white/60 hover:border-white font-semibold text-lg rounded-2xl transition-all">
              Download Pitch Deck
            </button>
          </div>

          <p className="mt-16 text-sm text-zinc-500">Panipat, Haryana, India • Expanding to Japan & Dubai</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-zinc-500">
          © 2026 JSRO Robotics. All Rights Reserved.<br />
          Made with passion for innovation and intelligence.
        </div>
      </footer>
    </div>
  );
}

export default App;