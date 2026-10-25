import { describe, expect, it } from 'vitest';
import { simulate } from './simulate';
import { stepBall } from './step';
import type { Ball, World } from './types';

function makeWorld(overrides: Partial<World> = {}): World {
  return {
    width: 800,
    height: 600,
    gravity: 980,
    restitution: 0.6,
    maxSpeed: 2000,
    restSpeed: 5,
    ...overrides,
  };
}

function makeBall(overrides: Partial<Ball> = {}): Ball {
  return {
    x: 400,
    y: 100,
    vx: 150,
    vy: -200,
    radius: 10,
    ...overrides,
  };
}

describe('simulate', () => {
  it('simulate-length-and-purity: returns `steps` snapshots and does not mutate the input ball', () => {
    const world = makeWorld();
    const ball = makeBall();
    const snapshot = { ...ball };
    const dt = 1 / 60;
    const steps = 25;

    const trajectory = simulate(ball, world, dt, steps);

    expect(trajectory).toHaveLength(steps);
    expect(ball).toEqual(snapshot);
  });

  it('simulate-determinism: identical inputs produce deeply equal trajectories', () => {
    const world = makeWorld();
    const ball = makeBall();
    const dt = 1 / 60;
    const steps = 40;

    const first = simulate(ball, world, dt, steps);
    const second = simulate(ball, world, dt, steps);

    expect(first).toEqual(second);
  });

  it('simulate-matches-manual-stepping: trajectory[i] equals i+1 manual stepBall calls', () => {
    const world = makeWorld();
    const ball = makeBall();
    const dt = 1 / 60;
    const steps = 15;

    const trajectory = simulate(ball, world, dt, steps);

    let manual = ball;
    for (let i = 0; i < steps; i++) {
      manual = stepBall(manual, world, dt);
      expect(trajectory[i]).toEqual(manual);
    }
  });
});
