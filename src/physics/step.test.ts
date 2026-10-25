import { describe, expect, it } from 'vitest';
import { stepBall } from './step';
import type { Ball, World } from './types';

const world: World = {
  width: 800,
  height: 600,
  gravity: 980,
  restitution: 0.5,
  maxSpeed: 2000,
  restSpeed: 5,
};

describe('stepBall', () => {
  it('step-gravity-accel: vy > 0 after one step, equal to gravity*dt', () => {
    const ball: Ball = { x: 400, y: 300, vx: 0, vy: 0, radius: 10 };
    const dt = 1 / 60;
    const next = stepBall(ball, world, dt);
    expect(next.vy).toBeGreaterThan(0);
    expect(next.vy).toBeCloseTo(world.gravity * dt, 10);
  });

  it('step-semi-implicit-order: position uses the post-gravity velocity', () => {
    const ball: Ball = { x: 100, y: 100, vx: 50, vy: 20, radius: 10 };
    const dt = 0.1;
    const next = stepBall(ball, world, dt);

    const expectedVy = ball.vy + world.gravity * dt;
    const expectedVx = ball.vx;
    const expectedX = ball.x + expectedVx * dt;
    const expectedY = ball.y + expectedVy * dt;

    expect(next.vx).toBeCloseTo(expectedVx, 10);
    expect(next.vy).toBeCloseTo(expectedVy, 10);
    expect(next.x).toBeCloseTo(expectedX, 10);
    expect(next.y).toBeCloseTo(expectedY, 10);
  });

  it('step-floor-bounce-restitution: reflects vy on floor contact and stays in bounds', () => {
    const ball: Ball = { x: 400, y: 585, vx: 0, vy: 100, radius: 10 };
    const dt = 0.1;
    const incomingVy = ball.vy + world.gravity * dt;
    const next = stepBall(ball, world, dt);

    expect(next.vy).toBeCloseTo(-world.restitution * incomingVy, 5);
    expect(next.y).toBeLessThanOrEqual(world.height - ball.radius + 1e-9);
    expect(next.y).toBeGreaterThanOrEqual(0);
  });

  it('step-wall-bounce: reflects vx to positive at the x=0 wall and stays in [0, width]', () => {
    const ball: Ball = { x: 5, y: 300, vx: -100, vy: 0, radius: 10 };
    const dt = 0.1;
    const next = stepBall(ball, world, dt);

    expect(next.vx).toBeGreaterThan(0);
    expect(next.x).toBeGreaterThanOrEqual(0);
    expect(next.x).toBeLessThanOrEqual(world.width);
  });

  it('step-ceiling-bounce: reflects vy to positive at the y=0 wall and stays in bounds', () => {
    const ball: Ball = { x: 400, y: 5, vx: 0, vy: -100, radius: 10 };
    const dt = 0.01;
    const next = stepBall(ball, world, dt);

    expect(next.vy).toBeGreaterThan(0);
    expect(next.y).toBeGreaterThanOrEqual(0);
    expect(next.y).toBeLessThanOrEqual(world.height);
  });

  it('step-come-to-rest: a slow ball resting on the floor stays at rest', () => {
    const ball: Ball = { x: 400, y: world.height - 10, vx: 1, vy: 0, radius: 10 };
    const dt = 0.001;

    const next = stepBall(ball, world, dt);
    expect(next.vx).toBe(0);
    expect(next.vy).toBe(0);

    const next2 = stepBall(next, world, dt);
    expect(next2.vx).toBe(0);
    expect(next2.vy).toBe(0);
  });

  it('step-purity: the input ball is unchanged after the call', () => {
    const ball: Ball = { x: 400, y: 300, vx: 10, vy: 20, radius: 10 };
    const snapshot = { ...ball };

    const next = stepBall(ball, world, 0.1);

    expect(ball).toEqual(snapshot);
    expect(next).not.toBe(ball);
  });
});
