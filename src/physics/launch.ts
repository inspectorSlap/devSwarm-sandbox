import type { Vec2, World } from './types';

/**
 * Compute a launch velocity from a drag gesture.
 *
 * The player drags forward (dragStart -> dragEnd); the launch fires in the
 * opposite direction, like pulling back a slingshot. Magnitude is the drag
 * distance scaled by `power`, clamped to `world.maxSpeed`.
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

  let vx = -dx * power;
  let vy = -dy * power;

  const speed = Math.sqrt(vx * vx + vy * vy);
  if (speed > world.maxSpeed) {
    const scale = world.maxSpeed / speed;
    vx *= scale;
    vy *= scale;
  }

  return { x: vx, y: vy };
}
