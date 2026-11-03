export interface Vec2 {
  x: number;
  y: number;
}

export interface Ball {
  pos: Vec2;
  vel: Vec2;
  radius: number;
  restitution: number;
}

export interface Bounds {
  width: number;
  height: number;
}

export function makeBall(pos: Vec2, vel: Vec2, radius: number, restitution: number): Ball {
  // Copy pos and vel objects to prevent shared reference mutation
  return {
    pos: { x: pos.x, y: pos.y },
    vel: { x: vel.x, y: vel.y },
    radius,
    restitution
  };
}
