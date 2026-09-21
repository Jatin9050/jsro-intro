import EventScaffold from './EventScaffold';
import { getEvent } from '@jsro/shared/events';

const EVENT = getEvent('innovation-challenge');

export default function InnovationChallenge() {
  return <EventScaffold event={EVENT} />;
}
