import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { getEvent } from '../data/events';
import { site, whatsappUrl } from '../data/site';

export default function ThankYou() {
  const { state } = useLocation();
  const event = state?.eventSlug ? getEvent(state.eventSlug) : null;
  const firstName = state?.name ? state.name.trim().split(' ')[0] : null;

  return (
    <div className="jsro-page">
      <SiteHeader />

      <main id="main-content" className="jsro-main jsro-measure">
        <p className="jsro-effective">Registration received</p>
        <h1 className="jsro-page-title">
          {firstName ? `Thanks, ${firstName}.` : 'Thanks — you are on the list.'}
        </h1>
        <p className="jsro-page-intro">
          {event
            ? `Your details for ${event.title} are with JSRO.`
            : 'Your details are with JSRO.'}{' '}
          The team confirms places by email, and will write to you with what happens next.
        </p>

        <div className="jsro-prose">
          <h2>About payment</h2>
          <p>
            Fees for this programme are not yet published, and online payment is not
            live on this site. Nothing is owed right now. When JSRO confirms your
            place, the email will say what the fee is and how to pay it.
          </p>

          <h2>If you need JSRO sooner</h2>
          <p>
            Message the team on{' '}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a>{' '}
            or email <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>

        <p style={{ marginTop: 44 }}>
          <Link className="jsro-action" to="/#events">
            Back to the events <ArrowUpRight size={19} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
