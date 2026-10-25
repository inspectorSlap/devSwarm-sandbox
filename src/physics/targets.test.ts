import { describe, expect, it } from 'vitest';
import type { Ball } from './types';
import { hitsTarget, placeTargets, type CircleTarget, type RectTarget, type Target } from './targets';

const bounds = { width: 800, height: 600 };

function ball(x: number, y: number, radius = 5): Ball {
  return { x, y, vx: 0, vy: 0, radius };
}

function extentsWithin(t: Target, w: number, h: number): boolean {
  if (t.kind === 'circle') {
    return t.x - t.radius >= 0 && t.x + t.radius <= w && t.y - t.radius >= 0 && t.y + t.radius <= h;
  }
  return t.x >= 0 && t.x + t.width <= w && t.y >= 0 && t.y + t.height <= h;
}

describe('placeTargets', () => {
  it('place-targets-count-and-bounds: returns count targets fully inside bounds', () => {
    for (let seed = 0; seed < 200; seed++) {
      const targets = placeTargets(seed, 12, bounds);
      expect(targets).toHaveLength(12);
      for (const t of targets) {
        expect(extentsWithin(t, bounds.width, bounds.height)).toBe(true);
      }
    }
  });

  it('place-targets-determinism: identical inputs yield deeply equal arrays', () => {
    expect(placeTargets(99, 10, bounds)).toEqual(placeTargets(99, 10, bounds));
  });

  it('place-targets-seed-variation: different seeds yield different layouts', () => {
    expect(placeTargets(1, 10, bounds)).not.toEqual(placeTargets(2, 10, bounds));
  });

  it('returns an empty array for count 0', () => {
    expect(placeTargets(5, 0, bounds)).toEqual([]);
  });
});

describe('hitsTarget circle', () => {
  const circle: CircleTarget = { kind: 'circle', x: 100, y: 100, radius: 10 };

  it('hits-target-circle-overlap: center within radius sum registers a hit', () => {
    expect(hitsTarget(ball(100 + 14, 100, 5), circle)).toBe(true);
    expect(hitsTarget(ball(100, 100), circle)).toBe(true);
  });

  it('hits-target-circle-overlap: just outside the radius sum does not hit', () => {
    expect(hitsTarget(ball(100 + 15.01, 100, 5), circle)).toBe(false);
  });
});

describe('hitsTarget rect', () => {
  const rect: RectTarget = { kind: 'rect', x: 100, y: 100, width: 50, height: 20 };

  it('hits-target-rect-overlap: ball touching an edge hits', () => {
    expect(hitsTarget(ball(90, 110, 10), rect)).toBe(true);
  });

  it('hits-target-rect-overlap: ball touching a corner hits via closest point', () => {
    const cornerDist = Math.SQRT2 * 3;
    expect(hitsTarget(ball(97, 97, cornerDist), rect)).toBe(true);
    expect(hitsTarget(ball(97, 97, cornerDist - 0.01), rect)).toBe(false);
  });

  it('hits-target-rect-overlap: ball clearly outside does not hit', () => {
    expect(hitsTarget(ball(0, 0, 5), rect)).toBe(false);
    expect(hitsTarget(ball(200, 110, 5), rect)).toBe(false);
  });
});
