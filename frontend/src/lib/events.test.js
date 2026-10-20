import { eventStatusLabel, hasRegistrationClosed, isRegistrationOpen } from '@jsro/shared/events';

const base = { registrationOpen: true, registrationCloses: '2026-11-23T00:00:00+05:30', closedLabel: 'Registration opens soon' };
const at = (iso) => Date.parse(iso);

describe('registration window', () => {
  test('open before the last moment', () => {
    const now = at('2026-11-22T23:59:59+05:30');
    expect(isRegistrationOpen(base, now)).toBe(true);
    expect(eventStatusLabel(base, now)).toBe('Registration open');
  });

  test('closed from the end of 22 Nov, India time', () => {
    const now = at('2026-11-23T00:00:00+05:30');
    expect(isRegistrationOpen(base, now)).toBe(false);
    expect(hasRegistrationClosed(base, now)).toBe(true);
    expect(eventStatusLabel(base, now)).toBe('Registration closed');
  });

  test('the cut-off is the same instant in any time zone (18:30 UTC on 22 Nov)', () => {
    expect(isRegistrationOpen(base, at('2026-11-22T18:29:59Z'))).toBe(true);
    expect(isRegistrationOpen(base, at('2026-11-22T18:30:00Z'))).toBe(false);
  });

  test('no deadline means it stays open while switched on', () => {
    const open = { registrationOpen: true };
    expect(isRegistrationOpen(open, at('2030-01-01T00:00:00Z'))).toBe(true);
  });

  test('switched off is never "closed", it is "not open yet"', () => {
    const off = { ...base, registrationOpen: false };
    expect(isRegistrationOpen(off, at('2026-10-20T00:00:00Z'))).toBe(false);
    expect(hasRegistrationClosed(off, at('2027-01-01T00:00:00Z'))).toBe(false);
    expect(eventStatusLabel(off, at('2026-10-20T00:00:00Z'))).toBe('Registration opens soon');
    expect(eventStatusLabel({ registrationOpen: false }, 0)).toBe('Coming soon');
  });
});
