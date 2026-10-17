import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { getEvent } from '@jsro/shared/events';
import { site, whatsappUrl } from '@jsro/shared/site';

/* A held-back event: its address works, but it says the event opens soon. */
export default function EventSoon({ slug }) {
  const event = getEvent(slug);

  useEffect(() => {
    const previous = document.title;
    document.title = `${event.title} · opening soon · ${site.name}`;
    return () => { document.title = previous; };
  }, [event.title]);

  return (
    <div className="jsro-page">
      <SiteHeader />

      <main id="main-content" className="jsro-main jsro-measure">
        <p className="jsro-effective">Opening soon</p>
        <h1 className="jsro-page-title">{event.title} opens soon.</h1>
        <p className="jsro-page-intro">
          {event.summary} We are finalising the details. Registration is not open yet,
          and the full programme will be published here when it is.
        </p>

        <p style={{ marginTop: 44, display: 'flex', flexWrap: 'wrap', gap: '14px 28px', alignItems: 'center' }}>
          <a className="jsro-action" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Ask {site.name} about it <ArrowUpRight size={19} strokeWidth={1.75} aria-hidden="true" />
          </a>
          <Link className="jsro-quiet-action" to="/#events">See the events that are open</Link>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
