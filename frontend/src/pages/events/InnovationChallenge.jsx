import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { animate, stagger, svg, utils } from 'animejs';
import { ArrowUpRight, Minus, MoveRight, Plus } from 'lucide-react';

import SiteFooter from '../../components/SiteFooter';
import { getEvent, eventStatusLabel, hasRegistrationClosed, isRegistrationOpen, registerPath, submitPath } from '@jsro/shared/events';
import { site, whatsappUrl } from '@jsro/shared/site';
import {
  about, benefits, categories, eligibility, faqs, hero,
  judging, prizes, rules, steps, submission, timeline, FEE,
} from './innovationChallengeContent';
import './InnovationChallenge.css';

const EVENT = getEvent('innovation-challenge');

// Shown once submissions are open: where a registered team uploads its project.
function SubmitLink({ onCopper = false }) {
  if (!EVENT.submissionsOpen) return null;
  return (
    <Link className={onCopper ? 'close-link' : 'silk-link'} to={submitPath(EVENT)}>
      Submit your project
    </Link>
  );
}

function RegisterButton({ onCopper = false }) {
  const tone = onCopper ? ' on-copper' : '';
  if (!isRegistrationOpen(EVENT)) {
    return (
      <span className={`copper-btn is-pending${tone}`} aria-disabled="true">
        {hasRegistrationClosed(EVENT) ? 'Registration closed' : 'Registration opens soon'}
      </span>
    );
  }
  return (
    <Link className={`copper-btn${tone}`} to={registerPath(EVENT)}>
      Register now <ArrowUpRight size={17} strokeWidth={2} aria-hidden="true" />
    </Link>
  );
}

/*
 * THE BOARD. A world of its own, scoped to this route, like CanSat.
 * Entrants build with Arduino, ESP32 and Raspberry Pi, so the page is drawn as
 * the thing they make: solder-mask green, copper traces, silkscreen white.
 * Board grammar is layout grammar — traces turn only at 45 degrees, and the
 * only round shapes are pads and vias.
 * One authored moment: the hero trace routes Problem -> Your idea -> Solution.
 * The seven-step trace draws once when it scrolls in. Nothing else moves
 * unless the visitor acts.
 */

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Draws copper traces with anime.js' drawable SVG, once. */
function useTraceDraw(ref, { onView = false, delay = 0 } = {}) {
  useEffect(() => {
    const host = ref.current;
    if (!host || reduceMotion()) return undefined;
    const traces = host.querySelectorAll('.trace-live');
    const vias = host.querySelectorAll('.via-live');
    const run = () => {
      animate(svg.createDrawable(traces), {
        draw: ['0 0', '0 1'],
        duration: 1400,
        delay: stagger(650, { start: delay }),
        ease: 'inOutQuad',
      });
      animate(vias, {
        scale: [0, 1],
        opacity: [0, 1],
        delay: stagger(160, { start: delay + 300 }),
        duration: 420,
        ease: 'outBack',
      });
    };
    utils.set(vias, { opacity: 0 });
    if (!onView) { run(); return undefined; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { run(); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(host);
    return () => io.disconnect();
  }, [ref, onView, delay]);
}

function HeroBoard() {
  const ref = useRef(null);
  useTraceDraw(ref, { delay: 350 });
  return (
    <figure className="board-art" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 560 420" preserveAspectRatio="xMidYMid meet">
        {/* idle copper: board texture, never animated */}
        <g className="trace-idle">
          {/* Same-layer copper never crosses, so none of these touch the live trace. */}
          <path d="M 20 210 H 110 L 140 240 V 330 L 170 360 H 300" />
          <path d="M 60 30 H 150 L 180 60 H 280" />
          <path d="M 540 70 H 440 L 410 100 V 118" />
          <path d="M 540 210 H 470 L 440 180" />
          <path d="M 200 400 V 380 L 220 360 H 300" />
        </g>
        {/* mounting holes */}
        {[[30, 30], [530, 30], [30, 390], [530, 390]].map(([x, y]) => (
          <g key={`${x}${y}`} className="mount"><circle cx={x} cy={y} r="11" /><circle cx={x} cy={y} r="5" /></g>
        ))}

        {/* the chip: your idea */}
        <g className="chip">
          <rect className="chip-body" x="230" y="118" width="120" height="150" rx="4" />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect className="pin" x="218" y={132 + i * 26} width="12" height="8" />
              <rect className="pin" x="350" y={132 + i * 26} width="12" height="8" />
            </g>
          ))}
          <circle className="chip-dot" cx="246" cy="134" r="4" />
          <text x="290" y="190" textAnchor="middle" className="silk-text">Your idea</text>
          <text x="290" y="212" textAnchor="middle" className="silk-small">IC26</text>
        </g>

        {/* live copper: Problem -> chip -> Solution */}
        <path className="trace-live" d="M 96 110 H 160 L 196 146 H 218" />
        <path className="trace-live" d="M 362 240 H 400 L 440 280 V 318 H 466" />

        <g className="via-live"><circle cx="160" cy="110" r="7" /><circle cx="160" cy="110" r="3" className="hole" /></g>
        <g className="via-live"><circle cx="400" cy="240" r="7" /><circle cx="400" cy="240" r="3" className="hole" /></g>
        <g className="via-live"><circle cx="440" cy="318" r="7" /><circle cx="440" cy="318" r="3" className="hole" /></g>

        <g className="pad pad-start"><circle cx="78" cy="110" r="18" /><circle cx="78" cy="110" r="7" className="hole" /></g>
        <text x="78" y="152" textAnchor="middle" className="silk-text">Problem</text>
        <g className="pad pad-end"><circle cx="484" cy="318" r="18" /><circle cx="484" cy="318" r="7" className="hole" /></g>
        <text x="484" y="360" textAnchor="middle" className="silk-text">Solution</text>
      </svg>
    </figure>
  );
}

function StepTrace() {
  const ref = useRef(null);
  // Vias sit in fluid grid columns, so measure where they really are rather
  // than guessing in a fixed viewBox — the trace must end exactly on via 7.
  const [geo, setGeo] = useState({ w: 1000, x1: 30, x2: 970 });
  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return undefined;
    const measure = () => {
      const vias = host.querySelectorAll('.step-via');
      if (vias.length < 2) return;
      const box = host.getBoundingClientRect();
      const centre = (el) => { const r = el.getBoundingClientRect(); return r.left - box.left + r.width / 2; };
      setGeo({ w: box.width, x1: centre(vias[0]), x2: centre(vias[vias.length - 1]) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);
  useTraceDraw(ref, { onView: true });
  return (
    <div className="steps-board" ref={ref}>
      <svg className="steps-svg" viewBox={`0 0 ${geo.w} 60`} aria-hidden="true">
        <path className="trace-live" d={`M ${geo.x1} 30 H ${geo.x2}`} />
      </svg>
      <ol className="steps-row">
        {steps.map((step, i) => (
          <li key={step.title}>
            <span className="step-via via-live" aria-hidden="true"><span>{i + 1}</span></span>
            <span className="step-title">{step.title}</span>
            <span className="step-detail">{step.detail}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Scorecard() {
  const ref = useRef(null);
  useEffect(() => {
    const host = ref.current;
    if (!host || reduceMotion()) return undefined;
    const pads = host.querySelectorAll('.alloc-pad');
    utils.set(pads, { scaleY: 0 });
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      animate(pads, { scaleY: [0, 1], duration: 520, delay: stagger(90), ease: 'outExpo' });
      io.disconnect();
    }, { threshold: 0.4 });
    io.observe(host);
    return () => io.disconnect();
  }, []);

  return (
    <div className="scorecard" ref={ref}>
      <div className="alloc" role="img"
        aria-label={judging.map((r) => `${r.criterion} ${r.weight} percent`).join(', ')}>
        {judging.map((row, i) => (
          <span key={row.criterion} className="alloc-pad"
            style={{ flexBasis: `${row.weight}%`, '--tint': 1 - i * 0.12 }}>
            <span className="alloc-num">{row.weight}</span>
          </span>
        ))}
      </div>
      <dl className="score-rows">
        {judging.map((row, i) => (
          <div className="score-row" key={row.criterion}>
            <dt><span className="score-key" style={{ '--tint': 1 - i * 0.12 }} aria-hidden="true" />{row.criterion}</dt>
            <dd>{row.weight}%</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Faq() {
  const [openIndex, setOpenIndex] = useState(null);
  const panels = useRef([]);
  useEffect(() => {
    const reduce = reduceMotion();
    panels.current.forEach((panel, index) => {
      if (!panel) return;
      const isOpen = index === openIndex;
      if (reduce) { panel.style.height = isOpen ? 'auto' : '0px'; panel.style.opacity = isOpen ? 1 : 0; return; }
      animate(panel, {
        height: isOpen ? [panel.offsetHeight, panel.scrollHeight] : [panel.offsetHeight, 0],
        opacity: isOpen ? 1 : 0,
        duration: 320,
        ease: 'outQuad',
        onComplete: () => { if (isOpen) panel.style.height = 'auto'; },
      });
    });
  }, [openIndex]);

  return (
    <div className="faq">
      {faqs.map((item, index) => {
        const isOpen = index === openIndex;
        return (
          <div className="faq-item" key={item.q} data-open={String(isOpen)}>
            <h3>
              <button type="button" className="faq-trigger" aria-expanded={isOpen}
                aria-controls={`faq-panel-${index}`} id={`faq-trigger-${index}`}
                onClick={() => setOpenIndex(isOpen ? null : index)}>
                <span>{item.q}</span>
                {isOpen ? <Minus size={18} strokeWidth={2} aria-hidden="true" /> : <Plus size={18} strokeWidth={2} aria-hidden="true" />}
              </button>
            </h3>
            <div className="faq-panel" id={`faq-panel-${index}`} role="region"
              aria-labelledby={`faq-trigger-${index}`} hidden={!isOpen}
              ref={(el) => { panels.current[index] = el; }}>
              <p>{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function InnovationChallenge() {
  const root = useRef(null);

  // This board's own faces, loaded only on this route.
  useEffect(() => {
    if (document.getElementById('board-faces')) return;
    const sheet = Object.assign(document.createElement('link'), {
      id: 'board-faces', rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Figtree:wght@400;500;600&display=swap',
    });
    document.head.append(sheet);
  }, []);

  useEffect(() => {
    if (reduceMotion()) return;
    animate(root.current.querySelectorAll('.hero-in'), {
      opacity: [0, 1], translateY: [16, 0], delay: stagger(80), duration: 640, ease: 'outExpo',
    });
  }, []);

  return (
    <div className="board" ref={root}>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <nav className="board-nav" aria-label="Breadcrumb">
        <Link className="board-back" to="/#events">
          <MoveRight size={15} strokeWidth={2} aria-hidden="true" style={{ transform: 'rotate(180deg)' }} />
          All JSRO events
        </Link>
        <span className="board-ident">JSRO Innovation Challenge 2026</span>
      </nav>

      <main id="main-content">
        <section className="board-hero" aria-labelledby="ic-title">
          <div className="hero-copy">
            <p className="silk-tag hero-in">{eventStatusLabel(EVENT)}</p>
            <h1 id="ic-title" className="hero-in">{hero.headline}</h1>
            <p className="hero-lede hero-in">{hero.sub}</p>
            <dl className="hero-pads hero-in">
              {hero.facts.map((f) => (
                <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>
              ))}
            </dl>
            <div className="board-actions hero-in">
              <RegisterButton />
              <SubmitLink />
              <a className="silk-link" href="#scoring">How entries are scored</a>
            </div>
          </div>
          <HeroBoard />
        </section>

        <section className="board-section board-about" aria-labelledby="about-title">
          <h2 id="about-title">What the challenge is</h2>
          <div className="board-prose">{about.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}</div>
        </section>

        <section className="board-section is-raised" id="categories" aria-labelledby="cat-title">
          <div className="section-head">
            <h2 id="cat-title">Five tracks</h2>
            <p>Pick the one your problem belongs to.</p>
          </div>
          <ul className="pin-list">
            {categories.map((c) => (
              <li key={c.slug}>
                <span className="pin-pad" aria-hidden="true" />
                <span className="pin-name">{c.name}</span>
                <span className="pin-detail">{c.detail}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="board-section" id="how" aria-labelledby="how-title">
          <div className="section-head">
            <h2 id="how-title">How it runs</h2>
            <p>Seven steps, all online.</p>
          </div>
          <StepTrace />
        </section>

        <section className="board-section is-raised" id="scoring" aria-labelledby="score-title">
          <div className="section-head">
            <h2 id="score-title">How entries are scored</h2>
            <p>Six criteria, one hundred marks, published up front so you can build towards them.</p>
          </div>
          <Scorecard />
        </section>

        <section className="board-section board-split" aria-labelledby="submit-title">
          <div>
            <h2 id="submit-title">What you submit</h2>
            <p className="section-note">{submission.note}</p>
            <ul className="silk-list">{submission.items.map((i) => <li key={i}>{i}</li>)}</ul>
          </div>
          <div>
            <h2>What you get out of it</h2>
            <dl className="benefit-list">
              {benefits.map((b) => <div key={b.title}><dt>{b.title}</dt><dd>{b.detail}</dd></div>)}
            </dl>
          </div>
        </section>

        <section className="board-section is-raised board-split" aria-labelledby="rules-title">
          <div>
            <h2 id="rules-title">Who can enter</h2>
            <ul className="silk-list">{eligibility.map((i) => <li key={i}>{i}</li>)}</ul>
          </div>
          <div>
            <h2>The rules</h2>
            <ol className="silk-list is-numbered">{rules.map((r) => <li key={r}>{r}</li>)}</ol>
          </div>
        </section>

        <section className="board-section board-split" aria-labelledby="when-title">
          <div>
            <h2 id="when-title">Dates</h2>
            <p className="section-note">Register by 22 Nov 2026 and submit by 20 Dec 2026.</p>
            <dl className="spec-list">
              {timeline.map((m) => <div key={m.milestone}><dt>{m.milestone}</dt><dd>{m.date}</dd></div>)}
            </dl>
          </div>
          <div>
            <h2>Prizes</h2>
            <p className="section-note">Sponsored by HR20 Car Custom.</p>
            <dl className="spec-list">
              {prizes.map((p) => <div key={p.place}><dt>{p.place}</dt><dd>{p.award}</dd></div>)}
            </dl>
          </div>
        </section>

        <section className="board-section is-raised" id="faq" aria-labelledby="faq-title">
          <div className="section-head"><h2 id="faq-title">Questions</h2></div>
          <Faq />
        </section>

        <section className="board-close" aria-labelledby="close-title">
          <h2 id="close-title">Don’t just have an idea. Build it.</h2>
          <p>
            Entry is {FEE} per team and the whole challenge runs online. First prize is ₹10,000.{' '}
            {isRegistrationOpen(EVENT)
              ? 'Register and pay by 22 Nov 2026 to get your registration code, or message JSRO with any question.'
              : hasRegistrationClosed(EVENT)
                ? 'Registration has closed. Message JSRO if you have a question.'
                : 'Registration has not opened yet — message JSRO and you will hear the moment it does.'}
            {EVENT.submissionsOpen && ' Already registered? Submit your project by 20 Dec 2026.'}
          </p>
          <div className="board-actions">
            <RegisterButton onCopper />
            <SubmitLink onCopper />
            <a className="close-link" href={`mailto:${site.email}?subject=${encodeURIComponent('JSRO Innovation Challenge 2026')}`}>{site.email}</a>
            <a className="close-link" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              WhatsApp <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
