import EventScaffold from './EventScaffold';
import { getEvent } from '@jsro/shared/events';

const EVENT = getEvent('jrc-2026');

export default function JrcChallenge() {
  return <EventScaffold event={EVENT} />;
}
