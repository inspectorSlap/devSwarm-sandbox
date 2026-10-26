import { afterEach, describe, expect, it, vi } from 'vitest';
import { getTimeDifference } from './diff';
import { UnknownTimeZoneError } from './zones';

const SYDNEY = 'Australia/Sydney';
const KATHMANDU = 'Asia/Kathmandu';
const KOLKATA = 'Asia/Kolkata';

describe('getTimeDifference straddling a Southern Hemisphere DST transition', () => {
  it('jumps by 60 minutes across the Sydney spring-forward transition (vs UTC)', () => {
    const transitionInstant = Date.UTC(2025, 9, 4, 16, 0, 0);
    expect(getTimeDifference(SYDNEY, 'UTC', transitionInstant - 1)).toBe(600);
    expect(getTimeDifference(SYDNEY, 'UTC', transitionInstant)).toBe(660);
  });

  it('drops by 60 minutes across the Sydney fall-back transition (vs UTC)', () => {
    const transitionInstant = Date.UTC(2025, 3, 5, 16, 0, 0);
    expect(getTimeDifference(SYDNEY, 'UTC', transitionInstant - 1)).toBe(660);
    expect(getTimeDifference(SYDNEY, 'UTC', transitionInstant)).toBe(600);
  });
});

describe('getTimeDifference between two fractional-offset, no-DST zones', () => {
  it('returns the constant 15-minute gap between Kathmandu (+5:45) and Kolkata (+5:30)', () => {
    expect(getTimeDifference(KATHMANDU, KOLKATA, Date.UTC(2025, 0, 1))).toBe(15);
    expect(getTimeDifference(KATHMANDU, KOLKATA, Date.UTC(2025, 6, 1))).toBe(15);
  });
});

describe('getTimeDifference invalid zone handling', () => {
  it('throws UnknownTimeZoneError for an unrecognized first zone', () => {
    expect(() => getTimeDifference('Not/AZone', 'UTC', Date.now())).toThrow(UnknownTimeZoneError);
  });

  it('throws UnknownTimeZoneError for an unrecognized second zone', () => {
    expect(() => getTimeDifference('UTC', 'Not/AZone', Date.now())).toThrow(UnknownTimeZoneError);
  });
});

describe('getTimeDifference default-to-current-time behavior', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('defaults the instant to the current machine time when omitted', () => {
    const fixedNow = Date.UTC(2025, 9, 4, 16, 0, 0); // Sydney's spring-forward instant.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(fixedNow);

    expect(getTimeDifference(SYDNEY, 'UTC')).toBe(getTimeDifference(SYDNEY, 'UTC', fixedNow));
    expect(getTimeDifference(SYDNEY, 'UTC')).toBe(660);
  });
});
