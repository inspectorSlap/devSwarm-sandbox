import { describe, expect, it } from 'vitest';
import { simulate } from './simulate';
import { stepBall } from './step';
import type { Ball, World } from './types';

const world: World = {
  width: 800,
  height: 600,
  gravity: 980,
  restitution: 0.6,
  maxSpeed: 2000,
  restSpeed: 5,
};

describe('simulate', () => {
  it('simulate-length-and-purity: returns `steps` snapshots and does not mutate the original ball', () => {
    const ball: Ball = { x: 400, y: 100, vx: 120, vy: -50, radius: 10 };
    const snapshot = { ...ball };
    const dt = 1 / 60;
    const steps = 30;

    const trajectory = simulate(ball, world, dt, steps);

    expect(trajectory.length).toBe(steps);
    expect(ball).toEqual(snapshot);
  });

  it('simulate-determinism: identical inputs produce deeply equal trajectories', () => {
    const ball: Ball = { x: 50, y: 50, vx: 200, vy: 0, radius: 15 };
    const dt = 1 / 60;
    const steps = 50;

    const t1 = simulate(ball, world, dt, steps);
    const t2 = simulate(ball, world, dt, steps);

    expect(t1).toEqual(t2);
  });

  it('simulate-matches-manual-stepping: trajectory[i] equals manual stepBall chaining', () => {
    const ball: Ball = { x: 100, y: 100, vx: 80, vy: -200, radius: 10 };
    const dt = 1 / 60;
    const steps = 20;

    const trajectory = simulate(ball, world, dt, steps);

    let manual = ball;
    for (let i = 0; i < steps; i += 1) {
      manual = stepBall(manual, world, dt);
      expect(trajectory[i]).toEqual(manual);
    }
  });
});
