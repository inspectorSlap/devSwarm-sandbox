# devSwarm-sandbox
devSwarm output sandbox — the swarm's commit target (Phase 0). Branch-protected; human-merge only. Holds throwaway representative content, no proprietary source.

## Timezone usage

Import everything from `src/timezone/index.ts`:

```ts
import {
  getTimeDifference,
  getCurrentTimeInZone,
  getTimeInZoneAt,
  utcToLocal,
  localToUtc,
} from './src/timezone';

// Zone vs zone: offset(zoneA) - offset(zoneB), in minutes, at an instant (default: now).
const diffMinutes = getTimeDifference('America/New_York', 'Europe/London');

// Current time in a zone.
const tokyoNow = getCurrentTimeInZone('Asia/Tokyo'); // { iso, ... }

// Project a given wall-clock time from one zone to another.
const projected = getTimeInZoneAt(
  'America/New_York',
  { year: 2025, month: 1, day: 14, hour: 9, minute: 0 },
  'Asia/Kolkata',
);

// Quick UTC <-> machine-local conversion (defaults to now).
const local = utcToLocal(Date.UTC(2025, 0, 15, 12, 0, 0));
const utcMs = localToUtc({ year: 2025, month: 1, day: 15, hour: 12, minute: 0 });
```
