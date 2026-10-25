import type { Ball, World } from './types';
import { createRng } from './rng';

export interface CircleTarget {
  kind: 'circle';
  x: number;
  y: number;
  radius: number;
}

export interface RectTarget {
  kind: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Target = CircleTarget | RectTarget;

/** Placement area, origin at (0, 0), matching the World box convention. */
export type Bounds = Pick<World, 'width' | 'height'>;

/**
 * Places `count` targets fully inside `bounds` using a PRNG seeded by `seed`.
 * Sizes scale with the smaller bounds dimension. Identical inputs always
 * yield an identical array.
 */
export function placeTargets(seed: number, count: number, bounds: Bounds): Target[] {
  const rand = createRng(seed);
  const scale = Math.min(bounds.width, bounds.height);
  const targets: Target[] = [];

  for (let i = 0; i < count; i++) {
    if (rand() < 0.5) {
      const radius = scale * (0.03 + 0.05 * rand());
      const x = radius + rand() * (bounds.width - 2 * radius);
      const y = radius + rand() * (bounds.height - 2 * radius);
      targets.push({ kind: 'circle', x, y, radius });
    } else {
      const width = scale * (0.05 + 0.15 * rand());
      const height = scale * (0.05 + 0.15 * rand());
      const x = rand() * (bounds.width - width);
      const y = rand() * (bounds.height - height);
      targets.push({ kind: 'rect', x, y, width, height });
    }
  }

  return targets;
}

/**
 * Tests whether `ball` (a circle of `ball.radius` at `(ball.x, ball.y)`)
 * overlaps `target`. Circles use center distance; rects use the distance from
 * the ball center to the closest point on the rectangle.
 */
export function hitsTarget(ball: Ball, target: Target): boolean {
  if (target.kind === 'circle') {
    const dx = ball.x - target.x;
    const dy = ball.y - target.y;
    const reach = ball.radius + target.radius;
    return dx * dx + dy * dy <= reach * reach;
  }

  const closestX = Math.min(Math.max(ball.x, target.x), target.x + target.width);
  const closestY = Math.min(Math.max(ball.y, target.y), target.y + target.height);
  const dx = ball.x - closestX;
  const dy = ball.y - closestY;
  return dx * dx + dy * dy <= ball.radius * ball.radius;
}
