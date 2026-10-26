export type CycleName = 'physical' | 'emotional' | 'intellectual' | 'passion' | 'mastery' | 'wisdom';

export type AlertLevel = 'peak' | 'critical' | 'none';

export interface CycleResult {
  value: number;
  percent: number;
  alert: AlertLevel;
}

export type BiorhythmResult<K extends CycleName = CycleName> = {
  [C in K]: CycleResult;
} & {
  date: string;
  t: number;
};

export type Period = 'day' | 'week' | 'month';

export interface BiorhythmOptions {
  mode: CycleName[];
  period: Period;
  backfill: boolean;
}
