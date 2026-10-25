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
 * World bounds are a full box: x in [0, width], y in [0, height], y-down
 * screen space. All tuning knobs are plain numbers so the render shell can
 * freely tune them without touching physics logic.
 */
export interface World {
  width: number;
  height: number;
  gravity: number;
  restitution: number;
  maxSpeed: number;
  restSpeed: number;
}
