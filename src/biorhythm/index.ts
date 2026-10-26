import { computeAllCycles } from './cycles';
import { addDays, dayCount, toLocalReportDate, toUtcDateOnly } from './date';
import type { BiorhythmResult, CycleName, CycleResult, Period } from './types';

export interface GetBiorhythmOptions<K extends CycleName = CycleName> {
  targetDate?: Date | string;
  mode?: K[];
  period?: Period;
  backfill?: boolean;
}

const ALL_CYCLES: CycleName[] = ['physical', 'emotional', 'intellectual', 'passion', 'mastery', 'wisdom'];

const PERIOD_LENGTHS: Record<Period, number> = { day: 1, week: 7, month: 30 };

function toIsoDay(input: Date | string | undefined, label: string): string {
  if (input === undefined || input === null) {
    throw new Error(`${label} is required`);
  }
  const day = toUtcDateOnly(input);
  if (Number.isNaN(day.getTime())) {
    throw new Error(`Invalid ${label}: ${String(input)}`);
  }
  return day.toISOString().slice(0, 10);
}

function formatLocalDate(isoDay: string): string {
  const local = toLocalReportDate(toUtcDateOnly(isoDay));
  const year = String(local.getFullYear()).padStart(4, '0');
  const month = String(local.getMonth() + 1).padStart(2, '0');
  const day = String(local.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildResult<K extends CycleName>(
  birthdayIso: string,
  dayIso: string,
  mode: readonly CycleName[],
): BiorhythmResult<K> {
  const t = dayCount(birthdayIso, dayIso);
  const all = computeAllCycles(t);
  const picked: Partial<Record<CycleName, CycleResult>> = {};
  for (const name of mode) {
    picked[name] = all[name];
  }
  return { ...picked, date: formatLocalDate(dayIso), t } as BiorhythmResult<K>;
}

function windowDays(targetIso: string, length: number, backfill: boolean): string[] {
  const target = toUtcDateOnly(targetIso);
  const start = backfill ? -length : 0;
  const end = length - 1;
  const days: string[] = [];
  for (let offset = start; offset <= end; offset++) {
    days.push(addDays(target, offset).toISOString().slice(0, 10));
  }
  return days;
}

export function getBiorhythm<K extends CycleName = CycleName>(
  birthday: Date | string,
  options: GetBiorhythmOptions<K> & { period: Period },
): BiorhythmResult<K>[];
export function getBiorhythm<K extends CycleName = CycleName>(
  birthday: Date | string,
  options?: GetBiorhythmOptions<K> & { period?: undefined },
): BiorhythmResult<K>;
export function getBiorhythm<K extends CycleName = CycleName>(
  birthday: Date | string,
  options: GetBiorhythmOptions<K> = {},
): BiorhythmResult<K> | BiorhythmResult<K>[] {
  const birthdayIso = toIsoDay(birthday, 'birthday');
  const targetIso = toIsoDay(options.targetDate ?? new Date(), 'targetDate');
  const mode = options.mode ?? ALL_CYCLES;

  if (options.period === undefined) {
    return buildResult<K>(birthdayIso, targetIso, mode);
  }

  const length = PERIOD_LENGTHS[options.period];
  return windowDays(targetIso, length, options.backfill === true).map((dayIso) =>
    buildResult<K>(birthdayIso, dayIso, mode),
  );
}
