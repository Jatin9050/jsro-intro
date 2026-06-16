import React, { useState, useEffect, useRef } from "react";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Mission", href: "#mission" },
  { label: "Architecture", href: "#architecture" },
  { label: "Timeline", href: "#timeline" },
  { label: "Mentors", href: "#mentors" },
  { label: "Gallery", href: "#gallery" },
];

const STATS = [
  { value: "30–50 km", label: "Altitude Reached" },
  { value: "6–8 mo", label: "Program Duration" },
  { value: "1/40th", label: "Cost of Orbital Sat" },
];

const MISSION_PILLARS = [
  { icon: "🚀", title: "Satellite Design", desc: "Design a 1U CubeSat-spec satellite from scratch using aerospace engineering principles and 3D-printed PLA structure." },
  { icon: "🛰", title: "Payload Development", desc: "Integrate sensors, camera, flight controller, GPS/GSM, and communication modules into your mission payload." },
  { icon: "📡", title: "Telemetry Systems", desc: "Build and operate a LoRaWAN-based communication system transmitting live data from near space to ground station." },
  { icon: "🌎", title: "GPS Tracking", desc: "Implement real-time GPS+GSM tracking to monitor satellite coordinates, altitude, and trajectory live." },
  { icon: "📷", title: "Space Imaging", desc: "Capture high-resolution images of Earth's curvature and atmospheric layers from 30–50 km altitude." },
  { icon: "☁️", title: "Atmospheric Research", desc: "Collect atmospheric data including temperature (−50°C), pressure (1/100 sea level), humidity, and UV radiation." },
  { icon: "🔬", title: "Scientific Experiments", desc: "Design and conduct custom scientific experiments in near space conditions — radiation, biology, materials, and more." },
  { icon: "🎈", title: "HAB Launch", desc: "Execute a real launch using a Helium CPR 1200 balloon with full ATC/Air Force/Ministry of Defence clearances." },
];

const COMPONENTS = [
  { num: "01", tag: "SENSING", icon: "🌡", title: "Sensor Suite", desc: "Multi-parameter environmental sensing array for atmospheric data collection during ascent and descent.", tags: ["Temperature", "Pressure", "Humidity", "UV", "IMU", "Gas"] },
  { num: "02", tag: "NAVIGATION", icon: "🛰", title: "GPS & GSM Module", desc: "Live coordinate tracking providing real-time latitude/longitude data streamed to ground station throughout flight.", tags: ["Live GPS Lock", "GSM Data", "Trajectory Map"] },
  { num: "03", tag: "CONTROL", icon: "🖥", title: "Flight Controller", desc: "Student-programmed RP2040-based OBC managing all satellite subsystems, data logging, and command execution.", tags: ["RP2040", "I2C/SPI", "Persistent Storage"] },
  { num: "04", tag: "IMAGING", icon: "📷", title: "Camera Module", desc: "High-resolution camera for capturing Earth's curvature, atmospheric layers, and stratospheric imagery during flight.", tags: ["Hi-Res", "Earth Curvature", "Video"] },
  { num: "05", tag: "COMMUNICATION", icon: "📻", title: "Ground Station", desc: "Mini ground station with LoRaWAN amateur radio receiver, laptop interface, and real-time dashboard software.", tags: ["LoRaWAN", "USB Interface", "Dashboard"] },
  { num: "06", tag: "RECOVERY", icon: "🪂", title: "Parachute System", desc: "Auto-deploying recovery parachute activates at balloon burst, guiding the satellite safely to the predicted landing zone.", tags: ["Auto-Deploy", "Reusable", "Safe Landing"] },
];

const TIMELINE = [
  { icon: "🔭", label: "Research", sub: "Space sciences, aerospace fundamentals" },
  { icon: "✏️", label: "Design", sub: "Satellite architecture and payload planning" },
  { icon: "🔧", label: "Development", sub: "Hardware assembly, 3D printing, coding" },
  { icon: "🧪", label: "Testing", sub: "Component testing, sensor calibration" },
  { icon: "💻", label: "Simulation", sub: "Mission simulation, trajectory modelling" },
  { icon: "🚀", label: "Launch", sub: "Full mission launch with official clearances" },
  { icon: "🗺", label: "Recovery", sub: "GPS-guided satellite field recovery" },
  { icon: "📊", label: "Analysis", sub: "Post-flight data analysis and mission report" },
];

const MENTORS = [
  { icon: "👨‍🔬", org: "EXPERTS", sub: "Aerospace Scientists & Engineers", desc: "10–12 expert-led sessions over 6–8 months at your school or university, with on-site training, prototyping, and simulation.", badge: "10–12 Sessions" },
];

const TESTIMONIALS = [
  { quote: "Congratulations to all the students at Dikshant School for their DikshantSat-I High Altitude Balloon Satellite. This is a landmark achievement in student space exploration.", name: "Prof. Chris Welch", role: "International Space University, France" },
  { quote: "This is so awesome, congrats to the whole team… so proud. Seeing young students build and launch real satellites is inspiring for the entire nation.", name: "Shantanu Moitra", role: "Renowned Music Director" },
  { quote: "The students surprised me with their eagerness to learn and their commitment to executing a complete space mission. This program raises the bar for STEM education worldwide.", name: "George Salazar", role: "NASA Johnson Space Center" },
];

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start || !target) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

function AnimatedStat({ target, suffix = "", label, started }) {
  const count = useCountUp(target, 2000, started);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 36, fontWeight: 700, color: "#60a5fa", lineHeight: 1 }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>{label}</div>
    </div>
  );
}

function HeroTelemetry() {
  const [alt, setAlt] = useState(0);
  const [tmp, setTmp] = useState(20);
  const [pre, setPre] = useState(1013);
  const [phase, setPhase] = useState("LAUNCH");

  useEffect(() => {
    const id = setInterval(() => {
      setAlt(a => {
        const next = a + Math.random() * 0.4;
        if (next > 35.4) { setPhase("STRATOSPHERE"); return 35.4; }
        if (next > 20) setPhase("ASCENT");
        return next;
      });
      setTmp(t => Math.max(-52, t - Math.random() * 0.5));
      setPre(p => Math.max(0.8, p - Math.random() * 5));
    }, 120);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      background: "rgba(15,23,42,0.9)", border: "1px solid rgba(96,165,250,0.3)",
      borderRadius: 12, padding: "16px 20px", fontFamily: "monospace",
      fontSize: 13, color: "#94a3b8", minWidth: 240, backdropFilter: "blur(8px)"
    }}>
      <div style={{ color: "#60a5fa", fontWeight: 700, marginBottom: 8, fontSize: 11, letterSpacing: 2 }}>
        ● {phase}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
        <span style={{ color: "#64748b" }}>HeSAT-01</span>
        <span style={{ color: "#22d3ee" }}>ONLINE</span>
        <span style={{ color: "#64748b" }}>ALT</span>
        <span style={{ color: "#f8fafc" }}>{alt.toFixed(1)} km</span>
        <span style={{ color: "#64748b" }}>TMP</span>
        <span style={{ color: "#60a5fa" }}>{tmp.toFixed(1)}°C</span>
        <span style={{ color: "#64748b" }}>PRE</span>
        <span style={{ color: "#f8fafc" }}>{pre.toFixed(1)} hPa</span>
        <span style={{ color: "#64748b" }}>GPS</span>
        <span style={{ color: "#4ade80" }}>LOCK ✓</span>
      </div>
      <div style={{ marginTop: 10, height: 40, position: "relative", borderTop: "1px solid rgba(96,165,250,0.2)" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "rgba(96,165,250,0.2)" }} />
        <div style={{
          position: "absolute", bottom: 0,
          left: `${(alt / 35.4) * 85}%`,
          transform: "translate(-50%, 0)",
          fontSize: 18, transition: "left 0.12s linear"
        }}>🛰</div>
        <div style={{ position: "absolute", top: 0, right: 0, fontSize: 10, color: "#475569" }}>50 km</div>
        <div style={{ position: "absolute", bottom: 0, left: 0, fontSize: 10, color: "#475569" }}>0 km</div>
      </div>
    </div>
  );
}

export default function AIRoboticsBootcamp() {
  const [statsStarted, setStatsStarted] = useState(false);
  const statsRef = useRef(null);
  const [activeComponent, setActiveComponent] = useState(0);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsStarted(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const btnStyle = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "12px 28px", borderRadius: 8, fontWeight: 600,
    fontSize: 15, cursor: "pointer", textDecoration: "none",
    transition: "all 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#f8fafc", fontFamily: "'Inter', 'Segoe UI', sans-serif", overflowX: "hidden" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(2,6,23,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(96,165,250,0.12)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 64,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🛰</span>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#f8fafc" }}>Smartcircuits</span>
          <span style={{ fontSize: 11, background: "rgba(96,165,250,0.15)", color: "#60a5fa", padding: "2px 8px", borderRadius: 20, border: "1px solid rgba(96,165,250,0.3)" }}>SPACE PROGRAM</span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {NAV_LINKS.map(l => (
            <a key={l.label} href={l.href} style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#f8fafc"}
              onMouseLeave={e => e.target.style.color = "#94a3b8"}>
              {l.label}
            </a>
          ))}
        </div>
        <a href="https://wa.me/917015229749" target="_blank" rel="noopener noreferrer"
          style={{ ...btnStyle, background: "#2563eb", color: "#fff", padding: "8px 20px", fontSize: 14, border: "none" }}>
          Enroll Now →
        </a>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "92vh", display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden", padding: "80px 32px",
      }}>
        {/* starfield */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
          {Array.from({ length: 80 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: Math.random() * 2 + 1, height: Math.random() * 2 + 1,
              borderRadius: "50%", background: "#fff",
              opacity: Math.random() * 0.7 + 0.1,
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            }} />
          ))}
        </div>
        {/* earth glow */}
        <div style={{ position: "absolute", bottom: -120, left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse at center, rgba(37,99,235,0.18) 0%, transparent 70%)", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 800 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
           
          </div>

          <h1 style={{ fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20, background: "linear-gradient(135deg, #f8fafc 0%, #93c5fd 50%, #60a5fa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Launch Your Own<br />Near Space Satellite
          </h1>
          <p style={{ fontSize: 18, color: "#94a3b8", maxWidth: 600, margin: "0 auto 36px", lineHeight: 1.7 }}>
            Design, Build, Test and Launch a Real High Altitude Balloon Satellite to the Edge of Space — reaching 30–50 km altitude, above 99% of Earth's atmosphere.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 56, flexWrap: "wrap" }}>
            <a href="https://wa.me/917015229749" target="_blank" rel="noopener noreferrer"
              style={{ ...btnStyle, background: "#2563eb", color: "#fff", border: "none" }}>
              Enroll Now →
            </a>
            <a href="#about" style={{ ...btnStyle, background: "transparent", color: "#f8fafc", border: "1px solid rgba(248,250,252,0.2)" }}>
              📄 Learn More
            </a>
          </div>

          <div style={{ display: "flex", gap: 48, justifyContent: "center", marginBottom: 48, flexWrap: "wrap" }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#60a5fa" }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <HeroTelemetry />
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: "96px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 12 }}>ABOUT THE PROGRAM</p>
            <h2 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.2, marginBottom: 20 }}>Real Space Technology Education for Future Engineers</h2>
            <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: 16 }}>
              <strong style={{ color: "#f8fafc" }}>JSRO Pvt. Ltd.</strong> is an applied research lab focusing on R&D and training in Space Sciences, Astronomy, Rocketry, Satellite design & launch, Electronics, Robotics, AI, IoT, and emerging technologies.
            </p>
            <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>
              Our Near Space Satellite Program gives students hands-on experience designing, building, and launching a real satellite that travels to the stratosphere — above 99% of Earth's atmosphere — reaching altitudes of 30–50 km.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
             
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { icon: "🛰", title: "Satellite Development", desc: "Build a real CubeSat-standard satellite with aluminium structure and space-grade components." },
              { icon: "🎈", title: "HAB Missions", desc: "Helium balloons carry your payload to 30–50 km altitude, staying aloft for 2–5 hours." },
              { icon: "📡", title: "Ground Station Ops", desc: "Track your satellite live using GPS + GSM, receive telemetry via LoRaWAN." },
              { icon: "🔬", title: "Scientific Experiments", desc: "Conduct atmospheric research measuring temperature, pressure, UV radiation, and more." },
            ].map(c => (
              <div key={c.title} style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(96,165,250,0.12)", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, color: "#f8fafc" }}>{c.title}</div>
                <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION GOAL ── */}
      <section style={{ padding: "0 32px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(15,23,42,0.9) 100%)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 16, padding: "40px 48px" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <span style={{ fontSize: 32 }}>🎯</span>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "#60a5fa" }}>Mission Goal</h3>
              <p style={{ color: "#cbd5e1", lineHeight: 1.8, fontSize: 16 }}>
                Students design and launch a HAB (High Altitude Balloon) satellite carrying custom sensors, GPS, camera, and telemetry systems to the edge of near space — experiencing −50°C temperatures and pressure 1/100th of sea level.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION PILLARS ── */}
      <section id="mission" style={{ padding: "80px 32px", background: "rgba(15,23,42,0.5)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 8 }}>MISSION HIGHLIGHTS</p>
            <h2 style={{ fontSize: 36, fontWeight: 700 }}>What You'll Build & Launch</h2>
            <p style={{ color: "#64748b", marginTop: 10 }}>Eight core mission pillars that make this the most comprehensive student aerospace program available.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {MISSION_PILLARS.map(p => (
              <div key={p.title} style={{
                background: "#0f172a", border: "1px solid rgba(96,165,250,0.1)", borderRadius: 12,
                padding: 24, transition: "border-color 0.2s, transform 0.2s", cursor: "default"
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(96,165,250,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(96,165,250,0.1)"; e.currentTarget.style.transform = "none"; }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{p.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, color: "#f8fafc" }}>{p.title}</div>
                <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEAR SPACE VS ORBITAL ── */}
      <section style={{ padding: "96px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 8 }}>WHY NEAR SPACE?</p>
          <h2 style={{ fontSize: 36, fontWeight: 700 }}>Near Space Satellite vs Orbital Satellite</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 24, alignItems: "stretch" }}>
          <div style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(15,23,42,0.9))", border: "2px solid rgba(96,165,250,0.4)", borderRadius: 16, padding: "32px 28px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 16 }}>NEAR SPACE SATELLITE</div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 16 }}>High Altitude Balloon Mission</div>
            {[
              "40× lower deployment cost than orbital satellites",
              "Rapid launch with minimal infrastructure",
              "30–50 km altitude — above 99% atmosphere",
              "Higher resolution imaging & data accuracy",
              "Recoverable, reusable, eco-friendly platform",
              "100+ sensor data points collected per mission",
              "Suitable for schools, universities, research orgs",
              "Real-world complete mission cycle experience",
              "₹1/40th the cost of an orbital satellite",
            ].map(i => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 13, color: "#cbd5e1", alignItems: "flex-start" }}>
                <span style={{ color: "#4ade80", marginTop: 1, flexShrink: 0 }}>✓</span>{i}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px" }}>
            <div style={{ background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.3)", borderRadius: "50%", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#60a5fa" }}>VS</div>
          </div>
          <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 16, padding: "32px 28px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#475569", marginBottom: 16 }}>ORBITAL SATELLITE</div>
            <div style={{ fontSize: 13, color: "#334155", marginBottom: 16 }}>Low Earth Orbit Mission</div>
            {[
              "Costs ₹2 Crore+ per mission",
              "Years of development & launch prep",
              "Complex regulatory approvals",
              "No payload recovery possible",
              "Contributes to space debris",
              "Not accessible for student budgets",
              "Requires dedicated launch facility",
              "Limited hands-on student involvement",
            ].map(i => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 13, color: "#475569", alignItems: "flex-start" }}>
                <span style={{ color: "#ef4444", marginTop: 1, flexShrink: 0 }}>✗</span>{i}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ARCHITECTURE ── */}
      <section id="architecture" style={{ padding: "80px 32px", background: "rgba(15,23,42,0.5)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 8 }}>MISSION ARCHITECTURE</p>
            <h2 style={{ fontSize: 36, fontWeight: 700 }}>How Your Mission Takes Flight</h2>
            <p style={{ color: "#64748b", marginTop: 10 }}>From helium balloon to ground recovery — the complete HAB satellite mission flow.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { icon: "🎈", label: "Helium Balloon", sub: "CPR 1200, He gas, 2m dia." },
              { icon: "🚀", label: "Ascent Phase", sub: "5 m/s to stratosphere" },
              { icon: "🛰", label: "Satellite Payload", sub: "Sensors, GPS, camera, TX" },
              { icon: "💥", label: "Balloon Burst", sub: "Auto-deploys parachute" },
              { icon: "🪂", label: "Parachute Descent", sub: "Guided safe descent" },
              { icon: "📡", label: "Ground Station", sub: "Live GPS, data retrieval" },
              { icon: "🔬", label: "Post-Flight Analysis", sub: "Data analysis, debrief" },
            ].map((step, i, arr) => (
              <React.Fragment key={step.label}>
                <div style={{ textAlign: "center", minWidth: 100, padding: "16px 8px" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(37,99,235,0.15)", border: "1px solid rgba(96,165,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 10px" }}>{step.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#f8fafc", lineHeight: 1.3 }}>{step.label}</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 4, lineHeight: 1.4 }}>{step.sub}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ color: "#2563eb", fontSize: 20, margin: "0 4px" }}>→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPONENTS ── */}
      <section style={{ padding: "96px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 8 }}>FLIGHT EQUIPMENT</p>
          <h2 style={{ fontSize: 36, fontWeight: 700 }}>Space-Grade Components</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 0, background: "#0f172a", border: "1px solid rgba(96,165,250,0.15)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ borderRight: "1px solid rgba(96,165,250,0.1)" }}>
            {COMPONENTS.map((c, i) => (
              <div key={c.num} onClick={() => setActiveComponent(i)}
                style={{
                  padding: "16px 20px", cursor: "pointer", borderBottom: "1px solid rgba(96,165,250,0.08)",
                  background: activeComponent === i ? "rgba(37,99,235,0.2)" : "transparent",
                  borderLeft: activeComponent === i ? "3px solid #2563eb" : "3px solid transparent",
                  transition: "all 0.15s"
                }}>
                <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1 }}>{c.num} / {c.tag}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: activeComponent === i ? "#60a5fa" : "#94a3b8", marginTop: 4 }}>{c.title}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: "40px 48px" }}>
            {(() => {
              const c = COMPONENTS[activeComponent];
              return (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{c.icon}</div>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: "#60a5fa", marginBottom: 8 }}>{c.num} / {c.tag}</div>
                  <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: "#f8fafc" }}>{c.title}</h3>
                  <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: 24 }}>{c.desc}</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {c.tags.map(t => (
                      <span key={t} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>{t}</span>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section id="timeline" style={{ padding: "80px 32px", background: "rgba(15,23,42,0.5)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 8 }}>PROGRAM TIMELINE</p>
            <h2 style={{ fontSize: 36, fontWeight: 700 }}>Your 6–8 Month Mission Journey</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
            {TIMELINE.map((step, i) => (
              <div key={step.label} style={{ position: "relative", padding: "24px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(37,99,235,0.3)", border: "1px solid rgba(96,165,250,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{step.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa" }}>PHASE {i + 1}</div>
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, color: "#f8fafc", marginBottom: 6 }}>{step.label}</div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{step.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MENTORS ── */}
      <section id="mentors" style={{ padding: "96px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 8 }}>EXPERT GUIDANCE</p>
          <h2 style={{ fontSize: 36, fontWeight: 700 }}>Guided by Global Space Experts</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {MENTORS.map(m => (
            <div key={m.org} style={{ background: "#0f172a", border: "1px solid rgba(96,165,250,0.15)", borderRadius: 16, padding: 28, transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(96,165,250,0.4)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(96,165,250,0.15)"}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{m.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#f8fafc", marginBottom: 4 }}>{m.org}</div>
              <div style={{ fontSize: 13, color: "#475569", marginBottom: 16 }}>{m.sub}</div>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, marginBottom: 16 }}>{m.desc}</p>
              <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.25)" }}>{m.badge}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS COUNTER ── */}
      <section ref={statsRef} style={{ padding: "80px 32px", background: "rgba(37,99,235,0.08)", borderTop: "1px solid rgba(96,165,250,0.1)", borderBottom: "1px solid rgba(96,165,250,0.1)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700 }}>Numbers That Define the Mission</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32 }}>
            <AnimatedStat target={50} suffix=" km" label="Maximum Altitude Reached" started={statsStarted} />
            <AnimatedStat target={99} suffix="%" label="Atmosphere Below You" started={statsStarted} />
            <AnimatedStat target={8} suffix=" months" label="Complete Program Duration" started={statsStarted} />
            <AnimatedStat target={20} suffix=" students" label="Student Team Size" started={statsStarted} />
            <AnimatedStat target={100} suffix="+ pts" label="Sensor Data Points Captured" started={statsStarted} />
          </div>
        </div>
      </section>

    
      {/* ── CTA ── */}
      <section style={{ padding: "96px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {[ "REAL MISSION"].map(b => (
              <span key={b} style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(96,165,250,0.3)", color: "#60a5fa", background: "rgba(96,165,250,0.06)" }}>{b}</span>
            ))}
          </div>
          <h2 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
            Become Part of the<br />Next Generation Space Mission
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 17, lineHeight: 1.7, marginBottom: 40 }}>
            Your school, university or organization could be the next to launch a real satellite. Join India's most advanced student aerospace program today.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://wa.me/917015229749" target="_blank" rel="noopener noreferrer"
              style={{ ...btnStyle, background: "#2563eb", color: "#fff", border: "none", fontSize: 16 }}>
              🚀 Join the Program
            </a>
            <a href="https://wa.me/917015229749" target="_blank" rel="noopener noreferrer"
              style={{ ...btnStyle, background: "rgba(37,99,235,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.3)" }}>
              💬 WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section style={{ padding: "0 32px 80px" }}>
        <div style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Stay Ahead</h3>
          <p style={{ color: "#64748b", marginBottom: 24, fontSize: 14 }}>Be the first to discover our latest news, events, and innovations.</p>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email"
              style={{ flex: 1, padding: "12px 16px", borderRadius: 8, border: "1px solid rgba(96,165,250,0.2)", background: "rgba(15,23,42,0.8)", color: "#f8fafc", fontSize: 14, outline: "none" }} />
            <button onClick={() => { if (email) { alert("Subscribed! 🚀"); setEmail(""); } }}
              style={{ ...btnStyle, background: "#2563eb", color: "#fff", border: "none", padding: "12px 20px", fontSize: 14 }}>
              Subscribe
            </button>
          </div>
          <p style={{ fontSize: 11, color: "#334155", marginTop: 10 }}>We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(96,165,250,0.1)", padding: "48px 32px", background: "#020617" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 20 }}>🛰</span>
                <span style={{ fontWeight: 700, fontSize: 16 }}>JSRO</span>
              </div>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
                JSRO is at the forefront of transforming STEM, Space Science and Technology through bold innovation.
              </p>
              <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
                {["Facebook", "Twitter", "Instagram", "LinkedIn"].map(s => (
                  <span key={s} style={{ fontSize: 12, color: "#475569", cursor: "pointer" }}>{s}</span>
                ))}
              </div>
            </div>
            {[
              { title: "Home", links: ["About Us", "E-learning", "Blogs", "Join Our Team"] },
              { title: "Join Us", links: ["Feedback", "Newsletter", "Become a Partner"] },
              { title: "Contact", links: ["98/1, Yamuna Vihar, Jagadhri, Haryana", "info@smartckts.com", "+91 7015229749"] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#f8fafc", marginBottom: 16, letterSpacing: 0.5 }}>{col.title}</div>
                {col.links.map(l => (
                  <div key={l} style={{ fontSize: 13, color: "#475569", marginBottom: 10, lineHeight: 1.5 }}>{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(96,165,250,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 12, color: "#334155" }}>© 2025 JSRO Pvt. Ltd.</span>
            <div style={{ display: "flex", gap: 20 }}>
              {["Privacy Policy", "Disclaimer", "Terms", "Refund Policy"].map(l => (
                <span key={l} style={{ fontSize: 12, color: "#334155", cursor: "pointer" }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
