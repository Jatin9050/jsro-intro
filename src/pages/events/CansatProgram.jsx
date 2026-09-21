import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MoveRight } from 'lucide-react';

import SiteFooter from '../../components/SiteFooter';
import { getEvent, registerPath, eventStatusLabel } from '../../data/events';
import { site, whatsappUrl } from '../../data/site';
import './CansatProgram.css';

const EVENT = getEvent('cansat-program');

const DIRECTION_CONTRACT = `
THESIS: A near-space programme page built as the radiosonde sounding record every high-altitude flight actually produces; it refuses both the starfield-and-neon template this category always ships and its predictable opposite, the white minimal spec sheet.
OWN-WORLD: The sounding record — buff chart stock #F2EDDF under a printed 22px/110px grid, form ink #221F1A, recorder-pen oxblood #A52F1C, rubber-stamp blue #1C4A74, Archivo Narrow uppercase over Courier Prime apparatus. Shares nothing with the site's graphite fieldbook.
STORY: A student reads the flight as a strip chart that unrolls from launch to recovery, sees the hardware and the readings plotted at the time they happen, and signs on at the end of the record.
FIRST VIEWPORT: A ruled form masthead over a gridded chart field; the pen trace begins at the time rail on the left and the offer with its REGISTER stamp sits at T+00:00.
FORM: The sounding record. Candidate 3 of 7 on the grounded direction list, seed key 10701b01.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
`;

/* The record's stations, in flight order. `t` is the time mark on the rail. */
const STATIONS = [
  { id: 'launch', t: 'T+00:00', key: 'Station 01 · Release' },
  { id: 'instrument', t: 'T+00:12', key: 'Station 02 · Instrument' },
  { id: 'burst', t: 'T+02:05', key: 'Station 03 · Burst' },
  { id: 'recovery', t: 'T+02:48', key: 'Station 04 · Recovery' },
  { id: 'preparation', t: 'PRE-FLIGHT', key: 'Station 05 · Preparation' },
  { id: 'signoff', t: 'SIGN-OFF', key: 'Station 06 · Sign-on' },
];

const INSTRUMENT = [
  { key: 'SEN', title: 'Sensor suite', body: 'Multi-parameter environmental array logging the column of air the satellite passes through, up and down.', parts: ['Temperature', 'Pressure', 'Humidity', 'UV', 'IMU', 'Gas'] },
  { key: 'NAV', title: 'GPS & GSM', body: 'Live coordinates streamed to the ground station for the length of the flight and through the descent.', parts: ['Live GPS lock', 'GSM downlink', 'Track'] },
  { key: 'OBC', title: 'Flight controller', body: 'A student-programmed RP2040 running every subsystem, executing the sequence and writing to storage.', parts: ['RP2040', 'I²C / SPI', 'Storage'] },
  { key: 'IMG', title: 'Camera', body: 'High-resolution capture of the curvature of the Earth and the atmospheric layers below.', parts: ['Stills', 'Video'] },
  { key: 'GND', title: 'Ground station', body: 'LoRaWAN receiver, laptop interface and live dashboard — the half of the mission that stays down here and listens.', parts: ['LoRaWAN', 'Dashboard'] },
  { key: 'REC', title: 'Recovery system', body: 'A parachute that deploys at burst and carries the payload to the predicted landing zone intact.', parts: ['Auto-deploy', 'Reusable'] },
];

const READINGS = [
  { term: 'Burst altitude', value: '30–50 km' },
  { term: 'Ascent rate', value: '≈ 5 m/s' },
  { term: 'Time aloft', value: '2–5 h' },
  { term: 'Outside air', value: '−50 °C' },
  { term: 'Ambient pressure', value: '1/100 sea level' },
  { term: 'Atmosphere below', value: '99 %' },
];

const RETURNS = [
  { key: 'R-01', title: 'Atmospheric column', body: 'Temperature, pressure, humidity, UV and gas sampled the whole way up and the whole way down.', note: 'Six channels' },
  { key: 'R-02', title: 'Imagery from the edge', body: 'Stills and video of the curvature of the Earth, taken by a camera the students mounted and aimed.', note: 'Onboard camera' },
  { key: 'R-03', title: 'The flown track', body: 'The real trajectory, plotted against the predicted path to see how far the model held.', note: 'GPS + GSM' },
  { key: 'R-04', title: 'The satellite itself', body: 'The payload is recovered, not expended. It comes back with the flight on it and can fly again.', note: 'Reusable' },
];

const PHASES = [
  { n: '01', label: 'Research', body: 'Space sciences and aerospace fundamentals.' },
  { n: '02', label: 'Design', body: 'Satellite architecture and payload planning.' },
  { n: '03', label: 'Development', body: 'Hardware assembly, 3D printing and code.' },
  { n: '04', label: 'Testing', body: 'Component testing and sensor calibration.' },
  { n: '05', label: 'Simulation', body: 'Mission simulation and trajectory modelling.' },
  { n: '06', label: 'Launch', body: 'Full mission launch with official clearances.' },
  { n: '07', label: 'Recovery', body: 'GPS-guided field recovery of the payload.' },
  { n: '08', label: 'Analysis', body: 'Post-flight data analysis and mission report.' },
];

function Tick({ mark }) {
  return (
    <span className="tick" aria-hidden="true">
      <span className="tick-label">{mark}</span>
    </span>
  );
}

/* The pen trace: time runs down, the pen's horizontal position is altitude.
   It climbs right to burst, then returns left under canopy. Drawn against the
   full height of the record so it reads as one continuous chart. */
function Trace({ height }) {
  const w = 240;
  const h = Math.max(height, 800);
  const p = (fraction, x) => `${x} ${(h * fraction).toFixed(1)}`;
  const d = [
    `M ${p(0.03, 12)}`,
    `C ${p(0.12, 26)} ${p(0.2, 58)} ${p(0.3, 104)}`,
    `C ${p(0.38, 142)} ${p(0.44, 186)} ${p(0.5, 214)}`,
    `C ${p(0.54, 196)} ${p(0.58, 150)} ${p(0.63, 96)}`,
    `C ${p(0.68, 58)} ${p(0.73, 30)} ${p(0.79, 18)}`,
    `L ${p(0.97, 14)}`,
  ].join(' ');

  return (
    <div className="trace-layer">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path className="trace-path trace-shadow" d={d} />
        <path className="trace-path trace-ink" d={d} />
      </svg>
    </div>
  );
}

export default function CansatProgram() {
  const chartRef = useRef(null);
  const [chartHeight, setChartHeight] = useState(2400);

  // The chart's own faces. Loaded here so the rest of the site never pays for them.
  useEffect(() => {
    const id = 'sounding-faces';
    if (document.getElementById(id)) return undefined;

    const pre = document.createElement('link');
    pre.rel = 'preconnect';
    pre.href = 'https://fonts.gstatic.com';
    pre.crossOrigin = 'anonymous';

    const sheet = document.createElement('link');
    sheet.id = id;
    sheet.rel = 'stylesheet';
    sheet.href =
      'https://fonts.googleapis.com/css2?family=Archivo+Narrow:wght@500;600;700&family=Courier+Prime:wght@400;700&display=swap';

    document.head.append(pre, sheet);
    return undefined;
  }, []);

  useEffect(() => {
    const hasContract = Array.from(document.body.childNodes).some(
      (node) => node.nodeType === Node.COMMENT_NODE && node.nodeValue.includes('10701b01')
    );
    if (!hasContract) {
      document.body.insertBefore(document.createComment(DIRECTION_CONTRACT), document.body.firstChild);
    }
  }, []);

  // The trace is drawn to the true height of the record, so it stays one chart.
  useEffect(() => {
    const element = chartRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => setChartHeight(entry.contentRect.height));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // The pen draws as the record unrolls, the way a drum recorder lays down ink.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const paths = Array.from(document.querySelectorAll('.trace-path'));
    if (!paths.length) return undefined;

    let frame = 0;
    const draw = () => {
      frame = 0;
      const element = chartRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const travelled = Math.min(Math.max(-rect.top + window.innerHeight * 0.85, 0), rect.height);
      const progress = rect.height ? travelled / rect.height : 1;
      paths.forEach((path) => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length * (1 - Math.min(progress, 1))}`;
      });
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [chartHeight]);

  const station = (index) => STATIONS[index];

  return (
    <div className="sounding">
      <a className="skip-link" href="#main-content">Skip to content</a>

      <nav className="sounding-nav" aria-label="Breadcrumb">
        <Link className="back" to="/#events">
          <MoveRight size={15} strokeWidth={2} aria-hidden="true" style={{ transform: 'rotate(180deg)' }} />
          All JSRO events
        </Link>
        <span className="ident">JSRO · HeSAT-01 · Flight record</span>
      </nav>

      <dl className="record-head">
        <div className="cell">
          <dt>Programme</dt>
          <dd>Near Space Satellite</dd>
        </div>
        <div className="cell">
          <dt>Vehicle</dt>
          <dd>Helium HAB, 2 m envelope</dd>
        </div>
        <div className="cell">
          <dt>Duration</dt>
          <dd>{EVENT.duration || '6–8 months'}</dd>
        </div>
        <div className="cell">
          <dt>Status</dt>
          <dd>{eventStatusLabel(EVENT)}</dd>
        </div>
      </dl>

      <main id="main-content" className="chart" ref={chartRef}>
        <Trace height={chartHeight} />

        {/* ---- T+00:00 release ---- */}
        <section className="station launch" id={station(0).id} aria-labelledby="launch-title">
          <Tick mark={station(0).t} />
          <p className="station-key">{station(0).key}</p>

          <p className="stamp" data-open={String(EVENT.registrationOpen)}>
            {eventStatusLabel(EVENT)}
          </p>

          <h1 id="launch-title">
            Fly a satellite
            <span>to the edge of space.</span>
          </h1>
          <p className="lede">
            Over six to eight months a student team designs, builds, tests and launches a real
            high-altitude balloon satellite — then tracks it down in a field and reads back
            everything it recorded on the way.
          </p>

          <div className="actions">
            <Link className="action" to={registerPath(EVENT)}>
              Register <ArrowUpRight size={17} strokeWidth={2.2} aria-hidden="true" />
            </Link>
            <a className="action-quiet" href="#preparation">See the eight phases</a>
          </div>
        </section>

        {/* ---- T+00:12 instrument ---- */}
        <section className="station" id={station(1).id} aria-labelledby="instrument-title">
          <Tick mark={station(1).t} />
          <p className="station-key">{station(1).key}</p>
          <h2 id="instrument-title">Six subsystems, all of them student-built</h2>
          <p>
            Every board, wire and line of code on the payload is the team's own work. The flight is
            the exam.
          </p>

          <div className="units">
            {INSTRUMENT.map((unit) => (
              <article className="unit" key={unit.key}>
                <span className="key">{unit.key}</span>
                <h3>{unit.title}</h3>
                <p>{unit.body}</p>
                <ul>
                  {unit.parts.map((part) => <li key={part}>{part}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* ---- T+02:05 burst ---- */}
        <section className="station" id={station(2).id} aria-labelledby="burst-title">
          <Tick mark={station(2).t} />
          <p className="station-key">{station(2).key}</p>
          <h2 id="burst-title">The envelope bursts. The parachute takes over.</h2>
          <p>
            The balloon expands as the air thins until it fails somewhere between thirty and fifty
            kilometres. Above that line sits less than one percent of the atmosphere, and the
            students' hardware spends hours in it.
          </p>

          <dl className="readings">
            {READINGS.map((reading) => (
              <div key={reading.term}>
                <dt>{reading.term}</dt>
                <dd>{reading.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---- T+02:48 recovery ---- */}
        <section className="station" id={station(3).id} aria-labelledby="recovery-title">
          <Tick mark={station(3).t} />
          <p className="station-key">{station(3).key}</p>
          <h2 id="recovery-title">Four things land with it</h2>
          <p>
            A flight that is not recovered is a story. A flight that is recovered is data, and the
            team that took it can argue with it.
          </p>

          <div className="returns">
            {RETURNS.map((item) => (
              <article key={item.key}>
                <span className="key">{item.key}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
                <span className="unit-note">{item.note}</span>
              </article>
            ))}
          </div>
        </section>

        {/* ---- pre-flight ---- */}
        <section className="station" id={station(4).id} aria-labelledby="preparation-title">
          <Tick mark={station(4).t} />
          <p className="station-key">{station(4).key}</p>
          <h2 id="preparation-title">Everything that happens before the release</h2>
          <p>
            Eight phases across six to eight months, with ten to twelve sessions led by aerospace
            engineers and scientists, run on site at your school or university.
          </p>

          <div className="phases">
            {PHASES.map((phase) => (
              <article className="phase" key={phase.n}>
                <span className="key">{phase.n}</span>
                <h3>{phase.label}</h3>
                <p>{phase.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ---- sign-off ---- */}
        <section className="station signoff" id={station(5).id} aria-labelledby="signoff-title">
          <Tick mark={station(5).t} />
          <p className="station-key">{station(5).key}</p>
          <h2 id="signoff-title">Put your team on the record</h2>
          <p>
            Registration is open. Fees are quoted per institution and team size — tell JSRO about
            your group and the team will come back with the outline and the cost.
          </p>

          <div className="actions">
            <Link className="action" to={registerPath(EVENT)}>
              Register <ArrowUpRight size={17} strokeWidth={2.2} aria-hidden="true" />
            </Link>
            <a
              className="action-quiet"
              href={`mailto:${site.email}?subject=${encodeURIComponent('Near Space Satellite Programme')}`}
            >
              {site.email}
            </a>
            <a className="action-quiet" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </div>

          <dl className="signoff-rule">
            <div>
              <dt>Operator</dt>
              <dd>{site.legalName}</dd>
            </div>
            <div>
              <dt>Programme lead</dt>
              <dd>{site.founder}</dd>
            </div>
            <div>
              <dt>Launch clearances</dt>
              <dd>Arranged by JSRO</dd>
            </div>
            <div>
              <dt>Fee</dt>
              <dd>{EVENT.fee || 'Quoted on request'}</dd>
            </div>
          </dl>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
