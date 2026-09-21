import { Link } from 'react-router-dom';
import { MoveUpRight } from 'lucide-react';
import { events, eventPath, eventStatusLabel } from '@jsro/shared/events';
import './EventList.css';

export default function EventList() {
  return (
    <ol className="event-list">
      {events.map((event) => (
        <li key={event.id}>
          <Link className="event-row jsro-reveal" to={eventPath(event)}>
            <i className="event-rule" aria-hidden="true" />

            <span className="event-status" data-open={String(event.registrationOpen)}>
              {eventStatusLabel(event)}
            </span>

            <span className="event-body">
              <span className="event-title">{event.title}</span>
              <span className="event-summary">{event.summary}</span>
              <span className="event-meta">
                <span>{event.focus}</span>
                <span>{event.date || 'Date to be announced'}</span>
                <span>{event.location || 'Venue to be announced'}</span>
              </span>
            </span>

            <MoveUpRight size={22} strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ol>
  );
}
