export interface Vec2 {
  x: number;
  y: number;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

/**
 * Physics world configuration.
 *
 * Bounds are a full box: x in [0, width], y in [0, height], in y-down
 * screen space (y increases downward, gravity is positive).
 *
 * All tuning fields are plain numbers so a render shell can freely tune
 * them at runtime; no hidden constants live in step/launch logic.
 */
export interface World {
  width: number;
  height: number;
  gravity: number;
  restitution: number;
  maxSpeed: number;
  restSpeed: number;
}
