import { describe, it, expect } from 'vitest';
import { makeBall } from './types';

describe('makeBall', () => {
  it('returns a Ball with fields matching the arguments passed in', () => {
    const pos = { x: 10, y: 20 };
    const vel = { x: 1, y: -1 };
    const radius = 5;
    const restitution = 0.8;
    
    const ball = makeBall(pos, vel, radius, restitution);
    
    expect(ball.pos.x).toBe(10);
    expect(ball.pos.y).toBe(20);
    expect(ball.vel.x).toBe(1);
    expect(ball.vel.y).toBe(-1);
    expect(ball.radius).toBe(5);
    expect(ball.restitution).toBe(0.8);
  });

  it('does not alias the pos or vel objects passed in', () => {
    const pos = { x: 10, y: 20 };
    const vel = { x: 1, y: -1 };
    const radius = 5;
    const restitution = 0.8;
    
    const ball = makeBall(pos, vel, radius, restitution);
    
    // Mutate the original objects
    pos.x = 999;
    pos.y = 999;
    vel.x = 999;
    vel.y = 999;
    
    // The ball's properties should remain unchanged
    expect(ball.pos.x).toBe(10);
    expect(ball.pos.y).toBe(20);
    expect(ball.vel.x).toBe(1);
    expect(ball.vel.y).toBe(-1);
  });

  it('returns a Ball with exactly the keys pos, vel, radius, restitution', () => {
    const pos = { x: 10, y: 20 };
    const vel = { x: 1, y: -1 };
    const radius = 5;
    const restitution = 0.8;
    
    const ball = makeBall(pos, vel, radius, restitution);
    
    const keys = Object.keys(ball);
    expect(keys).toHaveLength(4);
    expect(keys).toContain('pos');
    expect(keys).toContain('vel');
    expect(keys).toContain('radius');
    expect(keys).toContain('restitution');
    
    // Verify no extra properties
    expect(ball).not.toHaveProperty('x');
    expect(ball).not.toHaveProperty('y');
    expect(ball).not.toHaveProperty('vx');
    expect(ball).not.toHaveProperty('vy');
  });
});
