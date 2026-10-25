import { describe, expect, it } from 'vitest';
import type { Ball } from './types';
import type { Target } from './targets';
import { scoreRun } from './score';

function ball(x: number, y: number): Ball {
  return { x, y, vx: 0, vy: 0, radius: 1 };
}

const targets: Target[] = [
  { kind: 'circle', x: 10, y: 10, radius: 2 },
  { kind: 'rect', x: 50, y: 50, width: 10, height: 10 },
  { kind: 'circle', x: 200, y: 200, radius: 5 },
];

describe('scoreRun', () => {
  it('score-run-counts-unique-hits: a target overlapped on consecutive steps counts once', () => {
    const trajectory = [ball(0, 0), ball(10, 10), ball(10, 11), ball(11, 10), ball(100, 100)];
    const result = scoreRun(trajectory, targets);
    expect(result.hitIndices).toEqual([0]);
    expect(result.hitCount).toBe(1);
  });

  it('score-run-multiple-targets: identifies the subset actually hit', () => {
    const trajectory = [ball(0, 0), ball(55, 55), ball(30, 30), ball(199, 200)];
    const result = scoreRun(trajectory, targets);
    expect(result.hitIndices).toEqual([1, 2]);
    expect(result.hitCount).toBe(2);
  });

  it('reports no hits for an empty trajectory', () => {
    expect(scoreRun([], targets)).toEqual({ hitIndices: [], hitCount: 0 });
  });

  it('score-run-purity: inputs are unchanged after scoring', () => {
    const trajectory = [ball(10, 10), ball(55, 55)];
    const targetsCopy = structuredClone(targets);
    const trajectoryCopy = structuredClone(trajectory);
    scoreRun(trajectory, targets);
    expect(trajectory).toEqual(trajectoryCopy);
    expect(targets).toEqual(targetsCopy);
  });
});
