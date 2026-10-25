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
 * Physical/world tuning parameters. Bounds are a full box: x in [0, width],
 * y in [0, height], in a y-down screen coordinate space.
 */
export interface World {
  width: number;
  height: number;
  gravity: number;
  restitution: number;
  maxSpeed: number;
  restSpeed: number;
}
