import type { Ball } from './types';
import { hitsTarget, type Target } from './targets';

export interface ScoreResult {
  /** Ascending indices into `targets` of every target hit at least once. */
  hitIndices: number[];
  /** Number of distinct targets hit. */
  hitCount: number;
}

/**
 * Scores a trajectory against targets. A target counts once regardless of how
 * many steps overlap it. Pure: neither `trajectory` nor `targets` is modified.
 */
export function scoreRun(trajectory: readonly Ball[], targets: readonly Target[]): ScoreResult {
  const hitIndices: number[] = [];

  targets.forEach((target, index) => {
    for (const ball of trajectory) {
      if (hitsTarget(ball, target)) {
        hitIndices.push(index);
        return;
      }
    }
  });

  return { hitIndices, hitCount: hitIndices.length };
}
