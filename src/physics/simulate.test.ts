import { describe, expect, it } from 'vitest';
import { simulate } from './simulate';
import { stepBall } from './step';
import { launchVelocity } from './launch';
import { placeTargets } from './targets';
import { scoreRun } from './score';
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

  it('qa-dt-extremes: a sub-millisecond dt across many steps stays finite and in-bounds', () => {
    const dt = 1e-4;
    const steps = 5000;
    const ball: Ball = { x: 400, y: 50, vx: 300, vy: -50, radius: 10 };

    const trajectory = simulate(ball, world, dt, steps);

    expect(trajectory).toHaveLength(steps);
    for (const b of trajectory) {
      expect(Number.isFinite(b.x)).toBe(true);
      expect(Number.isFinite(b.y)).toBe(true);
      expect(Number.isFinite(b.vx)).toBe(true);
      expect(Number.isFinite(b.vy)).toBe(true);
      expect(b.x).toBeGreaterThanOrEqual(b.radius - 1e-6);
      expect(b.x).toBeLessThanOrEqual(world.width - b.radius + 1e-6);
      expect(b.y).toBeGreaterThanOrEqual(b.radius - 1e-6);
      expect(b.y).toBeLessThanOrEqual(world.height - b.radius + 1e-6);
    }
  });

  it('qa-dt-extremes: an extremely large dt (tunneling risk) still leaves every step clamped within world bounds', () => {
    const dt = 1000;
    const steps = 10;
    const ball: Ball = { x: 400, y: 300, vx: 50, vy: 50, radius: 10 };

    const trajectory = simulate(ball, world, dt, steps);

    expect(trajectory).toHaveLength(steps);
    for (const b of trajectory) {
      expect(Number.isFinite(b.x)).toBe(true);
      expect(Number.isFinite(b.y)).toBe(true);
      expect(Number.isFinite(b.vx)).toBe(true);
      expect(Number.isFinite(b.vy)).toBe(true);
      expect(b.x).toBeGreaterThanOrEqual(b.radius);
      expect(b.x).toBeLessThanOrEqual(world.width - b.radius);
      expect(b.y).toBeGreaterThanOrEqual(b.radius);
      expect(b.y).toBeLessThanOrEqual(world.height - b.radius);
    }
  });

  it('qa-maxspeed-contract: constant high gravity over many steps can exceed world.maxSpeed, documenting that the clamp is launch-only', () => {
    // A huge world with no walls in reach isolates gravity's effect on speed
    // from any wall-collision behavior.
    const highGravityWorld: World = {
      width: 100_000,
      height: 100_000,
      gravity: 50,
      restitution: 0.8,
      maxSpeed: 100,
      restSpeed: 5,
    };
    const ball: Ball = { x: 50_000, y: 50_000, vx: 0, vy: 0, radius: 10 };

    const trajectory = simulate(ball, highGravityWorld, 0.1, 30);
    const last = trajectory[trajectory.length - 1];
    expect(last).toBeDefined();

    // No wall was ever touched, confirming this is a pure gravity effect.
    for (const b of trajectory) {
      expect(b.x).toBeCloseTo(50_000, 6);
    }

    const finalSpeed = Math.hypot(last!.vx, last!.vy);
    expect(finalSpeed).toBeGreaterThan(highGravityWorld.maxSpeed);
  });
});

describe('qa-end-to-end-determinism (integration)', () => {
  it('launchVelocity -> simulate -> placeTargets -> scoreRun produces identical results for identical inputs run twice', () => {
    function runPipeline() {
      const pipelineWorld: World = {
        width: 800,
        height: 600,
        gravity: 980,
        restitution: 0.8,
        maxSpeed: 1000,
        restSpeed: 5,
      };
      const velocity = launchVelocity({ x: 100, y: 500 }, { x: 250, y: 420 }, 3, pipelineWorld);
      const ball: Ball = { x: 100, y: 500, vx: velocity.x, vy: velocity.y, radius: 12 };
      const trajectory = simulate(ball, pipelineWorld, 1 / 60, 180);
      const targets = placeTargets(2024, 8, { width: pipelineWorld.width, height: pipelineWorld.height });
      const score = scoreRun(trajectory, targets);
      return { velocity, trajectory, targets, score };
    }

    const run1 = runPipeline();
    const run2 = runPipeline();

    expect(run2).toEqual(run1);
    expect(run1.trajectory).toHaveLength(180);
  });
});
