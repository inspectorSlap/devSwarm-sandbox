import { describe, expect, it } from 'vitest';
import { simulate } from './simulate';
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

const initialBall: Ball = { x: 400, y: 50, vx: 120, vy: -60, radius: 10 };
const dt = 1 / 60;

describe('simulate', () => {
  it('simulate-length-and-purity: returns exactly `steps` snapshots and does not mutate the ball', () => {
    const snapshot = { ...initialBall };
    const steps = 25;
    const trajectory = simulate(initialBall, world, dt, steps);
    expect(trajectory).toHaveLength(steps);
    expect(initialBall).toEqual(snapshot);
  });

  it('simulate-determinism: two calls with identical inputs produce deeply equal trajectories', () => {
    const t1 = simulate(initialBall, world, dt, 50);
    const t2 = simulate(initialBall, world, dt, 50);
    expect(t1).toEqual(t2);
  });

  it('simulate-matches-manual-stepping: trajectory[i] equals manual stepBall i+1 times', () => {
    const steps = 10;
    const trajectory = simulate(initialBall, world, dt, steps);

    let manual = initialBall;
    for (let i = 0; i < steps; i++) {
      manual = stepBall(manual, world, dt);
      const fromTrajectory = trajectory[i];
      expect(fromTrajectory).toBeDefined();
      expect(fromTrajectory).toEqual(manual);
    }
  });
});
