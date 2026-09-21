import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { site, whatsappUrl } from '../data/site';

export default function AboutUs() {
  return (
    <div className="jsro-page">
      <SiteHeader />

      <main id="main-content" className="jsro-main jsro-measure">
        <p className="jsro-effective">About</p>
        <h1 className="jsro-page-title">{site.legalName}</h1>
        <p className="jsro-page-intro">
          An innovation-driven robotics and AI initiative focused on building real-world
          solutions, training the next generation of engineers, and creating a futuristic
          technology ecosystem.
        </p>

        <div className="jsro-prose">
          <h2>Who we are</h2>
          <p>
            JSRO believes innovation begins with curiosity. The work is to make robotics,
            artificial intelligence, drones, IoT, and emerging technologies accessible
            through practical, hands-on learning and real-world innovation.
          </p>
          <p>
            Founded to inspire the next generation of engineers, creators, and
            problem-solvers, JSRO provides robotics education, STEM workshops,
            competition-ready robotics kits, 3D printing services, drone technology
            training, and research and development solutions.
          </p>
          <p>
            <strong>We don’t just teach technology — we help people build it.</strong> Every
            workshop, project, and product is designed to encourage creativity, critical
            thinking, and engineering skills.
          </p>

          <h2>What we do</h2>
          <ul>
            {site.services.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>

          <h2>Our mission</h2>
          <p>
            To inspire and train the next generation of engineers, innovators, and creators
            by providing hands-on experience in AI, robotics, and future technologies.
          </p>

          <h2>Founder</h2>
          <p>
            Founded by <strong>{site.founder}</strong>
            <br />
            {site.founderRole}
          </p>

          <h2>Talk to JSRO</h2>
          <p>
            Message the team on{' '}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a>{' '}
            or email <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>

        <p style={{ marginTop: 44 }}>
          <Link className="jsro-action" to="/#events">
            See the events <ArrowUpRight size={19} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
