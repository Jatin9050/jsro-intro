import { useState, useEffect } from 'react';
import { Menu, X, Users, Target, Award, Calendar, Clock, MapPin } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://djezyrrnmqqhopamttkb.supabase.co';
const supabaseAnonKey = 'sb_publishable_DbgXDjtunz3CeFT2MLTKvQ_EDGFaaeW';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showMembership, setShowMembership] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);

  const [membershipData, setMembershipData] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    youtubeLink: ''
  });

  const [members, setMembers] = useState([]);

  // Load members from localStorage
  useEffect(() => {
    const savedMembers = JSON.parse(localStorage.getItem('JSROMembers') || '[]');
    setMembers(savedMembers);
  }, []);

  const events = [
    {
      id: 1,
      register: "bootcamp",
      title: "AI Robotics BootCamp",
      date: "May 5, 2026",
      time: "1 Hour per day",
      Duration: '4 days',
      location: "Online",
      negativeFees: "₹999",
      fees: "₹499",
      desc: "Online bootcamp on building AI-powered robots using Simulation",
      icon: "🤖",
      color: "from-cyan-400 to-blue-500",
      registration: "Register before 2 May, 2026",
      active: true
    },
    {
      id: 2,
      register: "workshop",
      title: "Advanced Automation Workshop",
      date: "May 30, 2026",
      time: "9:00 AM - 5:00 PM",
      location: "Delhi NCR",
      desc: "Competitive event for students to build automated systems",
      icon: "⚙️",
      color: "from-purple-400 to-pink-500",
      active: false
    },
    {
      id: 3,
      register: "boochallengetcamp",
      title: "JRC 2026 : IoT & Computer Vision Challenge",
      date: "May 22, 2026",
      time: "11:00 AM - 3:00 PM",
      location: "Offline",
      desc: "Learn computer vision and IoT integration in robotics",
      icon: "📡",
      color: "from-emerald-400 to-cyan-500",
      active: false
    }
  ];

  const products = [
    { name: "AI Robotics Modules", desc: "Intelligent plug-and-play modules with built-in AI", icon: "🤖" },
    { name: "Smart Automation Systems", desc: "Fully automated solutions for industrial use", icon: "⚙️" },
    { name: "Raspberry Pi & IoT Kits", desc: "Advanced integration kits with sensors & connectivity", icon: "📡" },
    { name: "Custom Robotics Solutions", desc: "Tailored robots for specific industry needs", icon: "🛠️" },
    { name: "Computer Vision Camera Kit", desc: "High-precision vision system for object detection", icon: "👁️" },
    { name: "AI Companion", desc: "Natural language processing enabled robots", icon: "🎤" },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const handleRegisterNow = (slug) => {
    if (!slug) return;
    window.location.href = `/${slug}`;
  };

  const handleMembershipChange = (e) => {
    const { name, value } = e.target;
    setMembershipData(prev => ({ ...prev, [name]: value }));
  };

  const handleMembershipSubmit = (e) => {
    e.preventDefault();
    if (!membershipData.name || !membershipData.email || !membershipData.youtubeLink) {
      alert("Please fill Name, Email and YouTube Project Link");
      return;
    }

    const newMember = {
      ...membershipData,
      date: new Date().toLocaleDateString()
    };

    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    localStorage.setItem('JSROMembers', JSON.stringify(updatedMembers));

    alert(`Thank you ${membershipData.name}! Your project has been submitted successfully.`);

    setMembershipData({ name: '', email: '', phone: '', school: '', youtubeLink: '' });
    setShowMembership(false);
  };

  const downloadBrochure = () => {
    const link = document.createElement('a');
    link.href = '/JSRO_Brochure.pdf';
    link.download = 'JSRO_Robotics_Brochure.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("Brochure is downloading...");
  };

  // ====================== REGISTER PAGE COMPONENT ======================
  function RegisterPage() {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      school: '',
      event: ''
    });

    const [loading, setLoading] = useState(false);

    // Extract event name from URL
    useEffect(() => {
      const path = window.location.pathname;
      let slug = '';

      if (path.includes('/register/')) {
        slug = path.split('/register/')[1];
      } else if (path !== '/' && path !== '') {
        slug = path.split('/')[1];
      }

      if (slug) {
        const eventName = decodeURIComponent(slug)
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        setFormData(prev => ({ ...prev, event: eventName }));
      }
    }, []);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.name || !formData.email || !formData.phone || !formData.school) {
        alert("Please fill all fields");
        return;
      }

      setLoading(true);

      const { error } = await supabase
        .from('event_registrations')
        .insert([formData]);

      setLoading(false);

      if (error) {
        console.error("Full Supabase Error:", error);
        alert(`Error: ${error.message}\n\nCode: ${error.code}`);
      } else {
        alert(`✅ Thank you ${formData.name}! Registration successful for ${formData.event}.`);
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    };

    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-md w-full overflow-hidden">
          <div className="px-8 py-8 border-b border-zinc-700 text-center">
            <h2 className="text-3xl font-bold">Event Registration</h2>
            <p className="text-cyan-400 font-semibold mt-2 text-lg">
              {formData.event || "Loading event..."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 focus:border-cyan-400 focus:outline-none"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 focus:border-cyan-400 focus:outline-none"
                placeholder="yourname@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 focus:border-cyan-400 focus:outline-none"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">School / College / Organization</label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleInputChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 focus:border-cyan-400 focus:outline-none"
                placeholder="e.g. ABC International School"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-400 to-purple-600 text-black font-semibold rounded-2xl hover:scale-105 transition-all disabled:opacity-70"
            >
              {loading ? "Submitting..." : "Confirm Registration"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentPath = window.location.pathname;

  // If URL has a slug (not root), show RegisterPage
  if (currentPath !== '/' && currentPath !== '') {
    return <RegisterPage />;
  }

  // ====================== MAIN LANDING PAGE ======================
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-black z-50 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center">
            <img alt="logo" src="/logojsro.jpeg" height="100px" width="100px" />
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button onClick={() => setShowEvents(true)} className="hover:text-cyan-400 transition-colors">Events</button>
            <button onClick={() => setShowMembership(true)} className="hover:text-cyan-400 transition-colors">Join Us</button>
            <button onClick={() => scrollToSection('vision')} className="hover:text-cyan-400 transition-colors">Vision</button>
            <button onClick={() => scrollToSection('products')} className="hover:text-cyan-400 transition-colors">Products</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-cyan-400 transition-colors">About Us</button>
          </div>

          <button
            onClick={() => scrollToSection('contact')}
            className="hidden md:block px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-cyan-400 hover:text-black transition-all"
          >
            Get In Touch
          </button>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-zinc-900 border-t border-zinc-800 py-6">
            <div className="flex flex-col gap-6 px-6 text-lg">
              <button onClick={() => setShowEvents(true)} className="text-left hover:text-cyan-400">Events</button>
              <button onClick={() => setShowMembership(true)} className="text-left hover:text-cyan-400">Join Us</button>
              <button onClick={() => scrollToSection('vision')} className="text-left hover:text-cyan-400">Vision</button>
              <button onClick={() => scrollToSection('products')} className="text-left hover:text-cyan-400">Products</button>
              <button onClick={() => scrollToSection('about')} className="text-left hover:text-cyan-400">About Us</button>
              <button onClick={() => scrollToSection('contact')} className="mt-4 px-6 py-3 bg-white text-black font-semibold rounded-full w-fit">
                Get In Touch
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Events Modal */}
      {showEvents && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-4xl w-full overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-700">
              <div>
                <h2 className="text-3xl font-bold">Upcoming Events</h2>
                <p className="text-zinc-400 mt-1">Choose an event to register</p>
              </div>
              <button onClick={() => setShowEvents(false)} className="text-3xl text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="p-8 grid md:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="group bg-zinc-800 border border-zinc-700 hover:border-cyan-400 rounded-3xl p-6 transition-all hover:scale-105"
                >
                  <span className={`inline-block px-3 py-1 mb-3 rounded-full text-xs font-semibold ${event.active ? "bg-green-500 text-black" : "bg-yellow-500 text-black"}`}>
                    {event.active ? "🔴 Live" : "Upcoming"}
                  </span>

                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${event.color} flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform`}>
                    {event.icon}
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{event.desc}</p>

                  <div className="space-y-2 text-sm text-zinc-500">
                    <div className="flex items-center gap-2">Duration : {event.Duration}</div>
                    <div className="flex items-center gap-2"><Calendar size={16} />{event.date}</div>
                    <div className="flex items-center gap-2"><Clock size={16} />{event.time}</div>
                    <div className="flex items-center gap-2"><MapPin size={16} />{event.location}</div>
                  </div>

                  <div className="text-xl font-bold mt-4">
                    <span className="line-through text-gray-400 mr-2">{event.negativeFees}</span>
                    <span className="text-green-600">{event.fees}</span>
                  </div>

                  <button
                    onClick={() => handleRegisterNow(event.register)}
                    disabled={!event.active}
                    className={`mt-6 w-full py-3 font-semibold rounded-2xl transition-all ${event.active
                      ? "bg-gradient-to-r from-cyan-400 to-purple-600 text-black hover:scale-105"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    {event.active ? "Register Now →" : "Coming Soon"}
                    {event.registration && <p className="text-xs mt-1">{event.registration}</p>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Membership Modal */}
      {showMembership && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-700">
              <div>
                <h2 className="text-3xl font-bold">Join Us</h2>
                <p className="text-zinc-400 mt-1">Share your robotics project idea</p>
              </div>
              <button onClick={() => setShowMembership(false)} className="text-3xl text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleMembershipSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={membershipData.name}
                  onChange={handleMembershipChange}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 focus:border-cyan-400"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={membershipData.email}
                  onChange={handleMembershipChange}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 focus:border-cyan-400"
                  placeholder="yourname@gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Phone Number (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={membershipData.phone}
                  onChange={handleMembershipChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 focus:border-cyan-400"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">School / College / Organization</label>
                <input
                  type="text"
                  name="school"
                  value={membershipData.school}
                  onChange={handleMembershipChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 focus:border-cyan-400"
                  placeholder="e.g. ABC International School"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Project Link (YouTube)</label>
                <input
                  type="url"
                  name="youtubeLink"
                  value={membershipData.youtubeLink}
                  onChange={handleMembershipChange}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 focus:border-cyan-400"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-cyan-400 to-purple-600 text-black font-semibold rounded-2xl hover:scale-105 transition-all"
              >
                Submit for Guidance
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-32 pb-32 relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <video src="/gifvideo.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/70"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-zinc-900/80 border border-cyan-500/30 backdrop-blur-md rounded-full px-5 py-2 mb-8">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-cyan-400 text-sm font-medium">Building the Future of Robotics</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-tight mb-6">
            The Next-Gen<br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Robotics Ecosystem
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-zinc-200 mb-12">
            AI-powered robotics modules making advanced automation accessible to students, educators, and industries.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollToSection('products')}
              className="px-10 py-4 bg-white text-black font-semibold rounded-2xl hover:bg-cyan-400 hover:scale-105 transition-all"
            >
              Explore Our Products
            </button>
            <button
              onClick={() => setShowMembership(true)}
              className="px-10 py-4 border border-white/70 hover:border-white font-semibold rounded-2xl transition-all"
            >
              Join Us
            </button>
          </div>

          <div className="mt-20 text-xs text-zinc-400 flex items-center justify-center gap-8">
            AI • IoT • COMPUTER VISION
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

      {/* Products Section */}
      <section id="products" className="py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Our Products & Solutions</h2>
            <p className="text-zinc-400 text-lg">Cutting-edge robotics solutions combining AI, IoT, and automation</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, i) => (
              <div
                key={i}
                className="group bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700 hover:border-cyan-400 rounded-3xl p-8 transition-all duration-300"
              >
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">{product.icon}</div>
                <h3 className="text-2xl font-semibold mb-3">{product.name}</h3>
                <p className="text-zinc-400">{product.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => setShowAllProducts(true)}
              className="px-10 py-4 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-semibold rounded-2xl transition-all"
            >
              View All Products →
            </button>
          </div>
        </div>
      </section>

      {/* All Products Modal */}
      {showAllProducts && (
        <div className="fixed inset-0 bg-zinc-950 z-[120] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex justify-between items-center mb-12 sticky top-0 bg-zinc-950 py-6 z-10 border-b border-zinc-800">
              <h2 className="text-5xl font-bold">All Products</h2>
              <button onClick={() => setShowAllProducts(false)} className="text-4xl text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {products.map((product, i) => (
                <div
                  key={i}
                  className="bg-zinc-900 border border-zinc-700 hover:border-cyan-400 rounded-3xl p-10 transition-all"
                >
                  <div className="text-7xl mb-8">{product.icon}</div>
                  <h3 className="text-3xl font-semibold mb-4">{product.name}</h3>
                  <p className="text-zinc-400 text-lg">{product.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* About Section */}
      <section id="about" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-16">About Us</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-zinc-900 p-10 rounded-3xl border border-zinc-700 text-center">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl flex items-center justify-center text-7xl">
                👨‍🔬
              </div>
              <h3 className="text-3xl font-bold mb-3">Meet Our Founder</h3>
              <p className="text-2xl text-cyan-400 mb-6">Jatin Sangwan</p>
              <p className="text-zinc-400 text-lg">
                Robotics Mentor & Innovator<br />
                Passionate about making robotics education accessible to everyone through practical, hands-on learning.
              </p>
            </div>

            <div className="bg-zinc-900 p-10 rounded-3xl border border-zinc-700">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-7xl">
                🧪
              </div>
              <h3 className="text-3xl font-bold mb-6 text-center">JSRO - Be an Innovator</h3>
              <p className="text-zinc-400 text-lg leading-relaxed">
                We are dedicated to revolutionizing robotics and AI education in India.
                Our goal is to make advanced technology affordable and accessible to students,
                schools, and industries through innovative modules and expert guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-28 bg-gradient-to-b from-zinc-900 to-black">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-6">Let's Build the Future Together</h2>
          <p className="text-xl text-zinc-400 mb-12">
            Whether you're an educator, student, institution, or industry partner — we're ready to collaborate.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@jsro.in"
              className="px-12 py-5 bg-white text-black font-semibold text-lg rounded-2xl hover:bg-cyan-400 transition-all"
            >
              Contact Us
            </a>
            <button
              onClick={downloadBrochure}
              className="px-12 py-5 border border-white/60 hover:border-white font-semibold text-lg rounded-2xl transition-all"
            >
              Download Brochure
            </button>
          </div>

          <p className="mt-16 text-sm text-zinc-500">Hisar, Haryana, India</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-16 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img alt="logo" src="/logojsro.jpeg" height="100px" width="100px" />
              </div>
              <p className="text-zinc-500 mb-6">Empowering the next generation through robotics and AI education.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-5 text-lg">Company</h4>
              <ul className="space-y-3 text-zinc-400">
                <li><a href="/" className="hover:text-white">About Us</a></li>
                <li><a href="/" className="hover:text-white">Blogs</a></li>
                <li><a href="/" className="hover:text-white">Gallery</a></li>
                <li><a href="/" className="hover:text-white">Careers</a></li>
                <li><a href="/" className="hover:text-white">Terms and Conditions</a></li>
                <li><a href="/" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-5 text-lg">Support</h4>
              <ul className="space-y-3 text-zinc-400">
                <li><a href="/" className="hover:text-white">Contact Us</a></li>
                <li><a href="/" className="hover:text-white">FAQs</a></li>
                <li><a href="/" className="hover:text-white">Sitemap</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-5 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-zinc-400 mb-8">
                <li><a href="/" className="hover:text-white">Partner With Us</a></li>
              </ul>
              <div className="text-sm">
                <p className="font-medium text-white">+91 9306647832</p>
                <a href="mailto:info@jsro.in" className="text-cyan-400 hover:underline">info@jsro.in</a>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 mt-16 pt-8 text-center text-sm text-zinc-500">
            © JSRO Be an Innovator 2022. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;