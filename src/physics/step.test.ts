import { describe, expect, it } from 'vitest';
import { stepBall } from './step';
import type { Ball, World } from './types';

const world: World = {
  width: 800,
  height: 600,
  gravity: 980,
  restitution: 0.8,
  maxSpeed: 1000,
  restSpeed: 5,
};

describe('stepBall', () => {
  it('step-gravity-accel: vy > 0 after one step in open space, equal to gravity*dt', () => {
    const ball: Ball = { x: 400, y: 100, vx: 0, vy: 0, radius: 10 };
    const dt = 1 / 60;
    const result = stepBall(ball, world, dt);
    expect(result.vy).toBeGreaterThan(0);
    expect(result.vy).toBeCloseTo(world.gravity * dt, 10);
  });

  it('step-semi-implicit-order: position uses post-gravity velocity', () => {
    const ball: Ball = { x: 100, y: 100, vx: 50, vy: 0, radius: 10 };
    const dt = 0.1;
    const result = stepBall(ball, world, dt);
    const expectedVy = 0 + world.gravity * dt;
    const expectedY = 100 + expectedVy * dt;
    const expectedX = 100 + 50 * dt;
    expect(result.vy).toBeCloseTo(expectedVy, 10);
    expect(result.y).toBeCloseTo(expectedY, 10);
    expect(result.x).toBeCloseTo(expectedX, 10);
  });

  it('step-floor-bounce-restitution: reflects vy to roughly -restitution*vy_incoming', () => {
    const radius = 10;
    const ball: Ball = {
      x: 400,
      y: world.height - radius - 1,
      vx: 0,
      vy: 200,
      radius,
    };
    const dt = 1 / 60;
    const incomingVy = ball.vy + world.gravity * dt;
    const result = stepBall(ball, world, dt);
    expect(result.vy).toBeCloseTo(-world.restitution * incomingVy, 5);
    expect(result.y).toBeLessThanOrEqual(world.height - radius + 1e-9);
    expect(result.y).toBeGreaterThanOrEqual(radius);
  });

  it('step-wall-bounce: moving left into x=0 reflects vx to positive, stays in [0, width]', () => {
    const radius = 10;
    const ball: Ball = { x: radius + 1, y: 300, vx: -200, vy: 0, radius };
    const dt = 1 / 60;
    const result = stepBall(ball, world, dt);
    expect(result.vx).toBeGreaterThan(0);
    expect(result.vx).toBeCloseTo(200 * world.restitution, 5);
    expect(result.x).toBeGreaterThanOrEqual(0);
    expect(result.x).toBeLessThanOrEqual(world.width);
  });

  it('step-ceiling-bounce: moving up into y=0 reflects vy to positive, stays in bounds', () => {
    const radius = 10;
    const ball: Ball = { x: 400, y: radius + 1, vx: 0, vy: -200, radius };
    const dt = 1 / 60;
    const result = stepBall(ball, world, dt);
    expect(result.vy).toBeGreaterThan(0);
    expect(result.y).toBeGreaterThanOrEqual(0);
    expect(result.y).toBeLessThanOrEqual(world.height);
  });

  it('step-come-to-rest: a slow ball resting on floor zeroes vx/vy and stays at rest', () => {
    const radius = 10;
    const ball: Ball = {
      x: 400,
      y: world.height - radius,
      vx: 1,
      vy: 1,
      radius,
    };
    let result = stepBall(ball, world, 1 / 60);
    expect(result.vx).toBe(0);
    expect(result.vy).toBe(0);

    for (let i = 0; i < 5; i++) {
      result = stepBall(result, world, 1 / 60);
      expect(result.vx).toBe(0);
      expect(result.vy).toBe(0);
    }
  });

  it('step-purity: the input ball is unchanged after the call', () => {
    const ball: Ball = { x: 400, y: 100, vx: 50, vy: -20, radius: 10 };
    const snapshot = { ...ball };
    stepBall(ball, world, 1 / 60);
    expect(ball).toEqual(snapshot);
  });

  it('qa-corner-collision: a ball driven into the bottom-right corner resolves both the wall and floor in the same step, staying in bounds with no NaN', () => {
    const radius = 10;
    const cornerWorld: World = { ...world, restitution: 0.5 };
    const ball: Ball = { x: 780, y: 580, vx: 3000, vy: 3000, radius };
    const dt = 0.1;

    const result = stepBall(ball, cornerWorld, dt);

    expect(Number.isFinite(result.x)).toBe(true);
    expect(Number.isFinite(result.y)).toBe(true);
    expect(Number.isFinite(result.vx)).toBe(true);
    expect(Number.isFinite(result.vy)).toBe(true);

    // Both the right wall and the floor were overshot in the same step.
    expect(result.x).toBeCloseTo(cornerWorld.width - radius, 9);
    expect(result.y).toBeCloseTo(cornerWorld.height - radius, 9);
    expect(result.x).toBeGreaterThanOrEqual(radius);
    expect(result.x).toBeLessThanOrEqual(cornerWorld.width - radius);
    expect(result.y).toBeGreaterThanOrEqual(radius);
    expect(result.y).toBeLessThanOrEqual(cornerWorld.height - radius);

    // Both velocity components were reflected away from the corner.
    expect(result.vx).toBeLessThan(0);
    expect(result.vy).toBeLessThan(0);
  });

  it('qa-corner-collision: a ball driven into the top-left corner resolves both the wall and ceiling in the same step', () => {
    const radius = 10;
    const cornerWorld: World = { ...world, restitution: 0.5 };
    const ball: Ball = { x: 20, y: 20, vx: -3000, vy: -3000, radius };
    const dt = 0.1;

    const result = stepBall(ball, cornerWorld, dt);

    expect(Number.isFinite(result.x)).toBe(true);
    expect(Number.isFinite(result.y)).toBe(true);
    expect(result.x).toBeCloseTo(radius, 9);
    expect(result.y).toBeCloseTo(radius, 9);
    expect(result.x).toBeGreaterThanOrEqual(radius);
    expect(result.y).toBeGreaterThanOrEqual(radius);
    expect(result.vx).toBeGreaterThan(0);
    expect(result.vy).toBeGreaterThan(0);
  });

  it('qa-restitution-zero: the ball stops dead on first floor contact and never re-ascends', () => {
    const zeroWorld: World = { ...world, restitution: 0, restSpeed: 5 };
    const radius = 10;
    let ball: Ball = { x: 400, y: 100, vx: 0, vy: 300, radius };
    const dt = 1 / 60;

    let contacted = false;
    for (let i = 0; i < 1000 && !contacted; i++) {
      ball = stepBall(ball, zeroWorld, dt);
      if (ball.y >= zeroWorld.height - radius - 1e-6) {
        contacted = true;
      }
    }

    expect(contacted).toBe(true);
    expect(ball.vy).toBeCloseTo(0, 9);
    expect(ball.vx).toBeCloseTo(0, 9);
    expect(ball.y).toBeCloseTo(zeroWorld.height - radius, 9);

    // Further steps must keep it pinned at the floor with no bounce back up.
    for (let i = 0; i < 20; i++) {
      ball = stepBall(ball, zeroWorld, dt);
      expect(ball.vy).toBe(0);
      expect(ball.vx).toBe(0);
      expect(ball.y).toBeCloseTo(zeroWorld.height - radius, 9);
    }
  });

  it('qa-restitution-one: a floor bounce reflects speed exactly, with no damping from the collision itself', () => {
    const bounceWorld: World = { ...world, restitution: 1 };
    const radius = 10;
    const ball: Ball = {
      x: 400,
      y: bounceWorld.height - radius - 1,
      vx: 0,
      vy: 200,
      radius,
    };
    const dt = 1 / 60;
    const incomingVy = ball.vy + bounceWorld.gravity * dt;

    const result = stepBall(ball, bounceWorld, dt);

    expect(result.vy).toBeCloseTo(-incomingVy, 9);
    expect(Math.abs(result.vy)).toBeCloseTo(Math.abs(incomingVy), 9);
  });

  it('qa-restitution-one: repeated bounces at a fine timestep do not diminish apex height over several cycles (ignoring the rest threshold)', () => {
    const bounceWorld: World = { ...world, restitution: 1, restSpeed: 0, gravity: 980 };
    const radius = 10;
    const dt = 1e-4;
    let ball: Ball = { x: 400, y: 100, vx: 0, vy: 0, radius };
    const startY = ball.y;
    const apexes: number[] = [];

    for (let i = 0; i < 300_000 && apexes.length < 4; i++) {
      const prevVy = ball.vy;
      ball = stepBall(ball, bounceWorld, dt);
      expect(Number.isFinite(ball.vy)).toBe(true);
      if (prevVy < 0 && ball.vy >= 0) {
        apexes.push(ball.y);
      }
    }

    expect(apexes.length).toBeGreaterThanOrEqual(3);
    for (const apex of apexes) {
      expect(apex).toBeGreaterThanOrEqual(radius);
      expect(apex).toBeLessThanOrEqual(startY + 1);
    }
  });
});
