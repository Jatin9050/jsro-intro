import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { animate, createScope, onScroll, stagger } from 'animejs';
import { ArrowDown, ArrowUpRight, MoveUpRight } from 'lucide-react';

import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import EventList from '../components/EventList';
import WorkshopForm from '../components/WorkshopForm';
import JoinUsForm from '../components/JoinUsForm';
import { site, whatsappUrl } from '@jsro/shared/site';
import './Home.css';

const DIRECTION_CONTRACT = `
THESIS: JSRO is a practical technology education organization; this homepage refuses the generic dark neon robotics template.
OWN-WORLD: Graphite fieldbook — warm iron #141210 and #1D1A17 surfaces, #F2EFEA drawn line, International Orange #FF4F00, Helvetica Neue, and 1px rules.
STORY: Visitors understand JSRO's hands-on learning focus, find the event that fits them, and can begin a conversation.
FIRST VIEWPORT: An asymmetric statement and a lit CSS 3D robot share a dark ruled field under one warm work lamp; the primary action sits below the offer.
FORM: Swiss / technical fieldbook, direction seed d4097df4.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
`;

function RobotScene() {
  return (
    <div className="robot-stage" aria-hidden="true">
      <div className="robot-field" />
      <div className="robot-shadow" />
      <div className="robot-assembly">
        <span className="robot-orbit orbit-one" />
        <span className="robot-orbit orbit-two" />
        <span className="robot-node node-one" />
        <span className="robot-node node-two" />
        <span className="robot-block robot-head"><span /></span>
        <span className="robot-block robot-neck"><span /></span>
        <span className="robot-block robot-body"><span /></span>
        <span className="robot-block robot-arm robot-arm-left"><span /></span>
        <span className="robot-block robot-arm robot-arm-right"><span /></span>
        <span className="robot-block robot-hip"><span /></span>
        <span className="robot-block robot-leg robot-leg-left"><span /></span>
        <span className="robot-block robot-leg robot-leg-right"><span /></span>
        <span className="robot-block robot-foot robot-foot-left"><span /></span>
        <span className="robot-block robot-foot robot-foot-right"><span /></span>
      </div>
    </div>
  );
}

function AmbientAssembly() {
  return (
    <div className="hero-ambient" aria-hidden="true">
      <span className="ambient-rail rail-one" />
      <span className="ambient-rail rail-two" />
      <span className="ambient-rail rail-three" />
      <span className="ambient-slab slab-one"><i /></span>
      <span className="ambient-slab slab-two"><i /></span>
      <span className="ambient-module-motion module-a"><span className="ambient-module"><i /></span></span>
      <span className="ambient-module-motion module-b"><span className="ambient-module"><i /></span></span>
      <span className="ambient-module-motion module-c"><span className="ambient-module"><i /></span></span>
      <span className="ambient-module-motion module-d"><span className="ambient-module"><i /></span></span>
      <span className="ambient-module-motion module-e"><span className="ambient-module"><i /></span></span>
      <span className="ambient-point point-a" />
      <span className="ambient-point point-b" />
      <span className="ambient-point point-c" />
    </div>
  );
}

function FocusMark({ index, title, description }) {
  return (
    <article className="focus-mark jsro-reveal">
      <i className="focus-rule" aria-hidden="true" />
      <span className="focus-index">{index}</span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <MoveUpRight size={22} strokeWidth={1.5} aria-hidden="true" />
    </article>
  );
}

export default function Home() {
  const root = useRef(null);

  useEffect(() => {
    const hasDirectionContract = Array.from(document.body.childNodes).some(
      (node) => node.nodeType === Node.COMMENT_NODE && node.nodeValue.includes('d4097df4')
    );
    if (!hasDirectionContract) {
      document.body.insertBefore(document.createComment(DIRECTION_CONTRACT), document.body.firstChild);
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animate(entry.target, {
            opacity: [0, 1],
            translateY: [18, 0],
            duration: 620,
            ease: 'outExpo',
            onComplete: () => {
              // Release the inline transform, or it outranks the :hover rules beneath it.
              entry.target.style.transform = '';
              entry.target.style.opacity = '';
            },
          });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18 }
    );

    // Ruled lists draw themselves up on entry — the page's second authored moment.
    const ruleObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const rules = entry.target.querySelectorAll('.focus-rule, .event-rule');
          if (rules.length) {
            animate(rules, {
              scaleX: [0, 1],
              duration: 700,
              delay: stagger(90),
              ease: 'outExpo',
            });
          }
          ruleObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );

    const scope = createScope({ root: root.current }).add(() => {
      animate('.jsro-hero-reveal', {
        opacity: [0, 1],
        translateY: [28, 0],
        filter: ['blur(8px)', 'blur(0px)'],
        delay: stagger(110),
        duration: 950,
        ease: 'outExpo',
      });

      animate('.robot-assembly', {
        translateY: [26, 0],
        opacity: [0, 1],
        duration: 950,
        loop: 1,
        ease: 'outExpo',
      });

      animate('.robot-orbit', {
        rotateZ: [0, 360],
        duration: 3200,
        loop: 1,
        ease: 'linear',
      });

      animate('.ambient-module-motion', {
        opacity: [0, 1],
        translateY: [42, 0],
        translateX: [-18, 0],
        duration: 900,
        delay: stagger(105, { from: 'center' }),
        ease: 'outExpo',
      });

      animate('.ambient-slab', {
        opacity: [0, 1],
        scale: [0.82, 1],
        duration: 1050,
        delay: stagger(140),
        ease: 'outExpo',
      });

      animate('.hero-ambient', {
        translateY: [-22, 38],
        rotateZ: [-1.5, 1.5],
        autoplay: onScroll({
          target: '.hero-section',
          sync: true,
          enter: 'top bottom',
          leave: 'bottom top',
        }),
      });

      animate('.robot-stage', {
        translateY: [28, -28],
        autoplay: onScroll({
          target: '.hero-robot-wrap',
          sync: true,
          enter: 'top bottom',
          leave: 'bottom top',
        }),
      });

      root.current.querySelectorAll('.jsro-reveal').forEach((element) => observer.observe(element));
      root.current
        .querySelectorAll('.focus-list, .event-list')
        .forEach((list) => ruleObserver.observe(list));
    });

    return () => {
      observer.disconnect();
      ruleObserver.disconnect();
      scope.revert();
    };
  }, []);

  return (
    <div className="jsro-home" ref={root}>
      <SiteHeader />

      <main id="main-content">
        <section className="hero-section" aria-labelledby="hero-title">
          <AmbientAssembly />
          <div className="hero-copy">
            <p className="hero-note jsro-hero-reveal">{site.name} · {site.tagline}</p>
            <h1 id="hero-title" className="jsro-hero-reveal">Build what<br />tomorrow <em>runs on.</em></h1>
            <p className="hero-intro jsro-hero-reveal">
              Practical learning in robotics, artificial intelligence, IoT, drone technology, 3D printing, and space sciences.
            </p>
            <div className="hero-actions jsro-hero-reveal">
              <a className="primary-action" href="#events">
                See the events <ArrowDown size={19} strokeWidth={1.75} aria-hidden="true" />
              </a>
              <a className="text-action" href={site.brochurePath} download>
                Download brochure <ArrowUpRight size={18} strokeWidth={1.7} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="hero-robot-wrap jsro-hero-reveal">
            <RobotScene />
          </div>

          <div className="hero-rail jsro-hero-reveal" aria-hidden="true">
            <span>Question</span><i />
            <span>Make</span><i />
            <span>Test</span><i />
            <span>Share</span>
          </div>
        </section>

        <section id="events" className="events-section" aria-labelledby="events-title">
          <div className="section-heading jsro-reveal">
            <h2 id="events-title">Three ways in.</h2>
            <p>Each programme runs on its own timeline. Open one to see what it involves.</p>
          </div>
          <EventList />
        </section>

        <section id="about" className="statement-section" aria-labelledby="statement-title">
          <p className="side-label jsro-reveal">Learning that leaves the screen</p>
          <div className="statement-copy jsro-reveal">
            <h2 id="statement-title">Technology makes sense when you can touch the problem.</h2>
            <p>
              {site.legalName} makes emerging technology accessible through practical learning, workshops, competition-ready kits, and research and development solutions.
            </p>
          </div>
          <Link className="statement-link jsro-reveal" to="/about-us">
            About {site.name} <ArrowUpRight size={20} strokeWidth={1.6} aria-hidden="true" />
          </Link>
        </section>

        <section id="programs" className="focus-section" aria-labelledby="focus-title">
          <div className="section-heading jsro-reveal">
            <h2 id="focus-title">Choose a place to start.</h2>
            <p>Explore the areas JSRO brings into the workshop and classroom.</p>
          </div>
          <div className="focus-list">
            <FocusMark index="A" title="Robotics & AI" description="Hands-on systems that connect intelligent software with real-world movement." />
            <FocusMark index="B" title="IoT & Computer Vision" description="Sensors, connectivity, and visual intelligence brought into practical projects." />
            <FocusMark index="C" title="Space Sciences & Drones" description="Technology learning that reaches beyond the desk and into real environments." />
            <FocusMark index="D" title="3D Printing & Prototyping" description="From first concept to a physical object ready for testing and iteration." />
          </div>
        </section>

        <section id="workshops" className="workshop-section" aria-labelledby="workshop-title">
          <div className="workshop-figure jsro-reveal" aria-hidden="true">
            <span className="measure measure-top">0</span>
            <span className="measure measure-bottom">360</span>
            <span className="workshop-ring ring-outer" />
            <span className="workshop-ring ring-inner" />
            <span className="workshop-axis axis-horizontal" />
            <span className="workshop-axis axis-vertical" />
            <span className="workshop-center" />
          </div>
          <div className="workshop-copy jsro-reveal">
            <h2 id="workshop-title">Bring the workshop to your learning space.</h2>
            <p>JSRO works with schools, colleges, and organizations through practical technology workshops and training. Tell us where, and we will come back with dates and a format.</p>
            <WorkshopForm />
          </div>
        </section>

        <section id="join" className="join-section" aria-labelledby="join-title">
          <div className="section-heading jsro-reveal">
            <h2 id="join-title">Built something already?</h2>
            <p>Show JSRO the project. Submissions are read by the team and answered by email.</p>
          </div>
          <div className="join-form-wrap jsro-reveal">
            <JoinUsForm />
          </div>
        </section>

        <section id="contact" className="contact-section" aria-labelledby="contact-title">
          <div className="contact-heading jsro-reveal">
            <p>Have a program, workshop, or collaboration in mind?</p>
            <h2 id="contact-title">Let’s make it tangible.</h2>
          </div>
          <div className="contact-actions jsro-reveal">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Contact {site.name} <ArrowUpRight size={22} strokeWidth={1.6} aria-hidden="true" />
            </a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
