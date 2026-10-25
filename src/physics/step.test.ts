import { describe, expect, it } from 'vitest';
import { stepBall } from './step';
import type { Ball, World } from './types';

function makeWorld(overrides: Partial<World> = {}): World {
  return {
    width: 800,
    height: 600,
    gravity: 980,
    restitution: 0.5,
    maxSpeed: 2000,
    restSpeed: 5,
    ...overrides,
  };
}

const ballRadius = 10;

function makeBall(overrides: Partial<Ball> = {}): Ball {
  return {
    x: 400,
    y: 300,
    vx: 0,
    vy: 0,
    radius: ballRadius,
    ...overrides,
  };
}

describe('stepBall', () => {
  it('step-gravity-accel: vy increases by gravity*dt in open space', () => {
    const world = makeWorld();
    const ball = makeBall({ vx: 0, vy: 0 });
    const dt = 1 / 60;
    const next = stepBall(ball, world, dt);
    expect(next.vy).toBeCloseTo(world.gravity * dt, 10);
    expect(next.vy).toBeGreaterThan(0);
  });

  it('step-semi-implicit-order: position uses the post-gravity velocity', () => {
    const world = makeWorld({ gravity: 100 });
    const ball = makeBall({ x: 400, y: 300, vx: 2, vy: 3 });
    const dt = 0.1;
    const next = stepBall(ball, world, dt);

    const expectedVx = 2;
    const expectedVy = 3 + 100 * dt;
    const expectedX = ball.x + expectedVx * dt;
    const expectedY = ball.y + expectedVy * dt;

    expect(next.vx).toBeCloseTo(expectedVx, 10);
    expect(next.vy).toBeCloseTo(expectedVy, 10);
    expect(next.x).toBeCloseTo(expectedX, 10);
    expect(next.y).toBeCloseTo(expectedY, 10);
  });

  it('step-floor-bounce-restitution: reflects vy by -restitution on floor contact', () => {
    const world = makeWorld({ gravity: 0, restitution: 0.6 });
    const ball = makeBall({ x: 400, y: world.height - ballRadius - 1, vx: 0, vy: 500 });
    const dt = 1 / 60;
    const vyIncoming = ball.vy + world.gravity * dt;
    const next = stepBall(ball, world, dt);

    expect(next.vy).toBeCloseTo(-world.restitution * vyIncoming, 5);
    expect(next.y).toBeLessThanOrEqual(world.height - ball.radius + 1e-9);
    expect(next.y).toBeGreaterThanOrEqual(ball.radius - 1e-9);
  });

  it('step-wall-bounce: reflects vx positive off the x=0 wall and stays in bounds', () => {
    const world = makeWorld();
    const ball = makeBall({ x: 5, y: 300, vx: -500, vy: 0 });
    const dt = 1 / 60;
    const next = stepBall(ball, world, dt);

    expect(next.vx).toBeGreaterThan(0);
    expect(next.x).toBeGreaterThanOrEqual(ball.radius - 1e-9);
    expect(next.x).toBeLessThanOrEqual(world.width - ball.radius + 1e-9);
  });

  it('step-ceiling-bounce: reflects vy positive off the y=0 wall and stays in bounds', () => {
    const world = makeWorld();
    const ball = makeBall({ x: 400, y: 5, vx: 0, vy: -500 });
    const dt = 1 / 60;
    const next = stepBall(ball, world, dt);

    expect(next.vy).toBeGreaterThan(0);
    expect(next.y).toBeGreaterThanOrEqual(ball.radius - 1e-9);
    expect(next.y).toBeLessThanOrEqual(world.height - ball.radius + 1e-9);
  });

  it('step-come-to-rest: a slow ball on the floor zeroes out and stays at rest', () => {
    const world = makeWorld({ gravity: 10, restSpeed: 5 });
    let ball = makeBall({ x: 400, y: world.height - 10, vx: 0.1, vy: 0.1 });
    const dt = 1 / 60;

    ball = stepBall(ball, world, dt);
    expect(ball.vx).toBe(0);
    expect(ball.vy).toBe(0);

    for (let i = 0; i < 10; i++) {
      ball = stepBall(ball, world, dt);
      expect(ball.vx).toBe(0);
      expect(ball.vy).toBe(0);
    }
  });

  it('step-purity: the input ball is unchanged after stepBall', () => {
    const world = makeWorld();
    const ball = makeBall({ x: 400, y: 300, vx: 10, vy: -10 });
    const snapshot = { ...ball };
    const next = stepBall(ball, world, 1 / 60);

    expect(ball).toEqual(snapshot);
    expect(next).not.toBe(ball);
  });
});
