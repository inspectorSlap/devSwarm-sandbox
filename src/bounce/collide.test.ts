import { describe, it, expect } from 'vitest';
import { resolveWalls } from './collide.js';
import { makeBall } from './types.js';

describe('resolveWalls', () => {
  const bounds = { width: 100, height: 100 };

  it('collide-left-wall: a ball crossing the left wall gets vel.x negated and scaled by restitution, and pos.x clamped to radius', () => {
    const ball = makeBall({ x: 5, y: 50 }, { x: -10, y: 0 }, 10, 0.8);
    const result = resolveWalls(ball, bounds);
    
    expect(result.vel.x).toBe(8); // -(-10) * 0.8 = 8
    expect(result.pos.x).toBe(10); // clamped to radius
    expect(result.vel.y).toBe(0); // unchanged
    expect(result.pos.y).toBe(50); // unchanged
  });

  it('collide-right-wall: a ball crossing the right wall gets vel.x negated and scaled by restitution, and pos.x clamped to bounds.width - radius', () => {
    const ball = makeBall({ x: 95, y: 50 }, { x: 10, y: 0 }, 10, 0.8);
    const result = resolveWalls(ball, bounds);
    
    expect(result.vel.x).toBe(-8); // -(10) * 0.8 = -8
    expect(result.pos.x).toBe(90); // clamped to bounds.width - radius
    expect(result.vel.y).toBe(0); // unchanged
    expect(result.pos.y).toBe(50); // unchanged
  });

  it('collide-top-wall: a ball crossing the top wall gets vel.y negated and scaled by restitution, and pos.y clamped to radius', () => {
    const ball = makeBall({ x: 50, y: 5 }, { x: 0, y: -10 }, 10, 0.8);
    const result = resolveWalls(ball, bounds);
    
    expect(result.vel.y).toBe(8); // -(-10) * 0.8 = 8
    expect(result.pos.y).toBe(10); // clamped to radius
    expect(result.vel.x).toBe(0); // unchanged
    expect(result.pos.x).toBe(50); // unchanged
  });

  it('collide-bottom-wall: a ball crossing the bottom wall gets vel.y negated and scaled by restitution, and pos.y clamped to bounds.height - radius', () => {
    const ball = makeBall({ x: 50, y: 95 }, { x: 0, y: 10 }, 10, 0.8);
    const result = resolveWalls(ball, bounds);
    
    expect(result.vel.y).toBe(-8); // -(10) * 0.8 = -8
    expect(result.pos.y).toBe(90); // clamped to bounds.height - radius
    expect(result.vel.x).toBe(0); // unchanged
    expect(result.pos.x).toBe(50); // unchanged
  });

  it('collide-corner: a ball simultaneously crossing two walls has both axes reflected and clamped in one call', () => {
    const ball = makeBall({ x: 5, y: 5 }, { x: -10, y: -10 }, 10, 0.8);
    const result = resolveWalls(ball, bounds);
    
    expect(result.vel.x).toBe(8); // -(-10) * 0.8 = 8
    expect(result.vel.y).toBe(8); // -(-10) * 0.8 = 8
    expect(result.pos.x).toBe(10); // clamped to radius
    expect(result.pos.y).toBe(10); // clamped to radius
    
    // Ensure results are finite and not NaN
    expect(Number.isFinite(result.vel.x)).toBe(true);
    expect(Number.isFinite(result.vel.y)).toBe(true);
    expect(Number.isFinite(result.pos.x)).toBe(true);
    expect(Number.isFinite(result.pos.y)).toBe(true);
  });

  it('collide-no-crossing-passthrough: a ball fully inside bounds with no wall crossing is returned with unchanged pos and vel values', () => {
    const ball = makeBall({ x: 50, y: 50 }, { x: 5, y: 5 }, 10, 0.8);
    const result = resolveWalls(ball, bounds);
    
    expect(result.vel.x).toBe(5); // unchanged
    expect(result.vel.y).toBe(5); // unchanged
    expect(result.pos.x).toBe(50); // unchanged
    expect(result.pos.y).toBe(50); // unchanged
  });

  it('collide-purity: the input ball object and its sub-objects are unchanged, and returned Ball is a different reference', () => {
    const originalPos = { x: 5, y: 50 };
    const originalVel = { x: -10, y: 0 };
    const ball = makeBall(originalPos, originalVel, 10, 0.8);
    
    const result = resolveWalls(ball, bounds);
    
    // Check that input ball is unchanged
    expect(ball.pos.x).toBe(5);
    expect(ball.pos.y).toBe(50);
    expect(ball.vel.x).toBe(-10);
    expect(ball.vel.y).toBe(0);
    expect(ball.radius).toBe(10);
    expect(ball.restitution).toBe(0.8);
    
    // Check that result is a different object
    expect(result).not.toBe(ball);
    expect(result.pos).not.toBe(ball.pos);
    expect(result.vel).not.toBe(ball.vel);
    
    // Check that original objects are unchanged
    expect(originalPos.x).toBe(5);
    expect(originalPos.y).toBe(50);
    expect(originalVel.x).toBe(-10);
    expect(originalVel.y).toBe(0);
  });
});
