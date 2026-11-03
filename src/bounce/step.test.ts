import { describe, it, expect } from 'vitest';
import { stepBall } from './step';
import { makeBall } from './types';

describe('stepBall', () => {
  describe('step-gravity-accel', () => {
    it('after one stepBall call from zero velocity, result.vel equals gravity*dt', () => {
      const ball = makeBall({ x: 0, y: 0 }, { x: 0, y: 0 }, 10, 0.8);
      const gravity = { x: 0, y: -9.8 };
      const dt = 0.1;

      const result = stepBall(ball, gravity, dt);

      expect(result.vel.x).toBeCloseTo(gravity.x * dt);
      expect(result.vel.y).toBeCloseTo(gravity.y * dt);
    });
  });

  describe('step-semi-implicit-order', () => {
    it('result.pos equals ball.pos + (ball.vel + gravity*dt)*dt', () => {
      const ball = makeBall({ x: 5, y: 10 }, { x: 2, y: 3 }, 10, 0.8);
      const gravity = { x: 0, y: -9.8 };
      const dt = 0.1;

      const result = stepBall(ball, gravity, dt);

      // Calculate expected position using semi-implicit Euler
      const expectedVelX = ball.vel.x + gravity.x * dt;
      const expectedVelY = ball.vel.y + gravity.y * dt;
      const expectedPosX = ball.pos.x + expectedVelX * dt;
      const expectedPosY = ball.pos.y + expectedVelY * dt;

      expect(result.pos.x).toBeCloseTo(expectedPosX);
      expect(result.pos.y).toBeCloseTo(expectedPosY);
    });
  });

  describe('step-purity', () => {
    it('the input ball object and its pos/vel sub-objects are unchanged', () => {
      const originalPos = { x: 5, y: 10 };
      const originalVel = { x: 2, y: 3 };
      const ball = makeBall(originalPos, originalVel, 10, 0.8);
      const gravity = { x: 0, y: -9.8 };
      const dt = 0.1;

      // Store original values for comparison
      const originalBall = { ...ball, pos: { ...ball.pos }, vel: { ...ball.vel } };

      const result = stepBall(ball, gravity, dt);

      // Verify input ball is unchanged
      expect(ball.pos.x).toBe(originalBall.pos.x);
      expect(ball.pos.y).toBe(originalBall.pos.y);
      expect(ball.vel.x).toBe(originalBall.vel.x);
      expect(ball.vel.y).toBe(originalBall.vel.y);
      expect(ball.radius).toBe(originalBall.radius);
      expect(ball.restitution).toBe(originalBall.restitution);

      // Verify returned Ball is a different object reference
      expect(result).not.toBe(ball);
      expect(result.pos).not.toBe(ball.pos);
      expect(result.vel).not.toBe(ball.vel);
    });
  });

  describe('step-passthrough', () => {
    it('radius and restitution on the returned Ball equal those on the input ball', () => {
      const ball = makeBall({ x: 0, y: 0 }, { x: 0, y: 0 }, 15, 0.9);
      const gravity = { x: 0, y: -9.8 };
      const dt = 0.1;

      const result = stepBall(ball, gravity, dt);

      expect(result.radius).toBe(ball.radius);
      expect(result.restitution).toBe(ball.restitution);
    });
  });
});
