import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { eventStatusLabel, registerPath } from '../../data/events';
import { site, whatsappUrl } from '../../data/site';
import './EventScaffold.css';

/*
 * The frame every event detail page sits in: facts, the registration action,
 * and a place for the programme's own content.
 *
 * Unconfirmed facts render as "To be announced" rather than being invented.
 * Pass `children` to add the programme's real sections once JSRO confirms them.
 */
export default function EventScaffold({ event, children }) {
  const facts = [
    { term: 'Focus', value: event.focus },
    { term: 'Date', value: event.date },
    { term: 'Duration', value: event.duration },
    { term: 'Hours', value: event.time },
    { term: 'Location', value: event.location },
  ].filter((fact) => Boolean(fact.value));

  return (
    <div className="jsro-page">
      <SiteHeader />

      <main id="main-content">
        <section className="event-hero">
          <Link className="jsro-quiet-action event-back" to="/#events">
            All events
          </Link>

          <p className="event-status-tag" data-open={String(event.registrationOpen)}>
            {eventStatusLabel(event)}
          </p>
          <h1 className="event-hero-title">{event.title}</h1>
          <p className="event-hero-summary">{event.summary}</p>

          <div className="event-hero-actions">
            <Link className="jsro-action" to={registerPath(event)}>
              Register your interest <ArrowUpRight size={19} strokeWidth={1.75} aria-hidden="true" />
            </Link>
            <a className="jsro-quiet-action" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Ask a question <ArrowUpRight size={18} strokeWidth={1.7} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="event-facts" aria-label="Programme details">
          <dl>
            {facts.map((fact) => (
              <div key={fact.term}>
                <dt>{fact.term}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
            <div>
              <dt>Fee</dt>
              <dd>
                {event.fee || (
                  <a className="event-fee-link" href={`mailto:${site.email}?subject=${encodeURIComponent(`Fees for ${event.title}`)}`}>
                    Contact JSRO for fees
                  </a>
                )}
              </dd>
            </div>
          </dl>
        </section>

        {children}

        <section className="event-contact">
          <h2>Want the full outline?</h2>
          <p>
            The detailed programme for this event is being finalised. Register your
            interest and JSRO will send it to you first, or message the team directly.
          </p>
          <div className="event-hero-actions">
            <Link className="jsro-action" to={registerPath(event)}>
              Register your interest <ArrowUpRight size={19} strokeWidth={1.75} aria-hidden="true" />
            </Link>
            <a className="jsro-quiet-action" href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
