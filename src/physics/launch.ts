import type { Vec2, World } from './types';

/**
 * Computes the launch velocity for a "pull back and release" drag gesture.
 * The velocity points opposite the drag vector (dragEnd - dragStart), with
 * magnitude scaled by `power` and clamped to `world.maxSpeed`.
 */
export function launchVelocity(
  dragStart: Vec2,
  dragEnd: Vec2,
  power: number,
  world: World,
): Vec2 {
  const dx = dragEnd.x - dragStart.x;
  const dy = dragEnd.y - dragStart.y;
  const dragLength = Math.sqrt(dx * dx + dy * dy);

  if (dragLength === 0) {
    return { x: 0, y: 0 };
  }

  const rawSpeed = dragLength * power;
  const speed = Math.min(rawSpeed, world.maxSpeed);
  const scale = speed / dragLength;

  return { x: -dx * scale, y: -dy * scale };
}
