import EventScaffold from './EventScaffold';
import { getEvent } from '../../data/events';

const EVENT = getEvent('innovation-challenge');

export default function InnovationChallenge() {
  return <EventScaffold event={EVENT} />;
}
