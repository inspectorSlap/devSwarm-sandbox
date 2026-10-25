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
});
