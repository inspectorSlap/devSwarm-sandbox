import { square } from '../square';
import type { Vec2, World } from './types';

/**
 * Computes a launch velocity from a drag gesture: dragging forward (e.g. to
 * the right) is a "pull back and release" motion, so the resulting velocity
 * points opposite the drag vector. Magnitude is scaled by `power` and
 * clamped to `world.maxSpeed` so the render shell can tune the clamp without
 * touching this logic.
 */
export function launchVelocity(
  dragStart: Vec2,
  dragEnd: Vec2,
  power: number,
  world: World,
): Vec2 {
  const dx = dragEnd.x - dragStart.x;
  const dy = dragEnd.y - dragStart.y;

  if (dx === 0 && dy === 0) {
    return { x: 0, y: 0 };
  }

  const vx = -dx * power;
  const vy = -dy * power;
  const speed = Math.sqrt(square(vx) + square(vy));

  if (speed > world.maxSpeed && speed > 0) {
    const scale = world.maxSpeed / speed;
    return { x: vx * scale, y: vy * scale };
  }

  return { x: vx, y: vy };
}
