import { describe, it, expect } from "vitest";

/**
 * Solver result contract shared across all polynomial solvers.
 * Every solver returns exactly this shape.
 */
export interface SolveResult {
  roots: number[];
  discriminant: number | null;
  degree: number;
}

const EPS = 1e-12;

/** Degenerate case: 0 = 0 (infinite/no discrete roots) or contradiction. */
export function solveDegenerate(): SolveResult {
  return { roots: [], discriminant: null, degree: 0 };
}

/** Linear: b*x + c = 0. */
export function solveLinear(b: number, c: number): SolveResult {
  if (Math.abs(b) < EPS) {
    return solveDegenerate();
  }
  return { roots: [-c / b], discriminant: null, degree: 1 };
}

/**
 * Quadratic: a*x^2 + b*x + c = 0.
 * Falls back to the linear solver when a == 0.
 */
export function solveQuadratic(a: number, b: number, c: number): SolveResult {
  if (Math.abs(a) < EPS) {
    return solveLinear(b, c);
  }

  const discriminant = b * b - 4 * a * c;

  if (discriminant < -EPS) {
    // No real roots.
    return { roots: [], discriminant, degree: 2 };
  }

  if (Math.abs(discriminant) <= EPS) {
    // Repeated real root.
    const r = -b / (2 * a);
    return { roots: [r, r], discriminant, degree: 2 };
  }

  const sqrtD = Math.sqrt(discriminant);
  const r1 = (-b + sqrtD) / (2 * a);
  const r2 = (-b - sqrtD) / (2 * a);
  return { roots: [r1, r2].sort((x, y) => x - y), discriminant, degree: 2 };
}

const within = (actual: number, expected: number, tol = 1e-10) =>
  Math.abs(actual - expected) <= tol;

const expectResultShape = (res: SolveResult) => {
  expect(Object.keys(res).sort()).toEqual(
    ["degree", "discriminant", "roots"].sort()
  );
  expect(Array.isArray(res.roots)).toBe(true);
  res.roots.forEach((r) => expect(typeof r).toBe("number"));
  expect(
    res.discriminant === null || typeof res.discriminant === "number"
  ).toBe(true);
  expect(typeof res.degree).toBe("number");
};

describe("quadratic solver", () => {
  it("qa-output-shape [contract]: returns exactly { roots, discriminant, degree }", () => {
    expectResultShape(solveQuadratic(1, -3, 2));
    expectResultShape(solveQuadratic(0, 2, -4)); // linear fallback
    expectResultShape(solveQuadratic(0, 0, 0)); // degenerate fallback
    expectResultShape(solveQuadratic(1, 0, 1)); // complex -> empty roots
  });

  it("solves two distinct real roots in ascending order", () => {
    const res = solveQuadratic(1, -3, 2); // (x-1)(x-2)
    expect(res.degree).toBe(2);
    expect(res.roots.length).toBe(2);
    expect(within(res.roots[0], 1)).toBe(true);
    expect(within(res.roots[1], 2)).toBe(true);
    // ascending
    expect(res.roots[0]).toBeLessThanOrEqual(res.roots[1]);
  });

  it("validates the discriminant against b^2 - 4ac", () => {
    const res = solveQuadratic(2, -4, -6);
    expect(res.discriminant).toBe((-4) * (-4) - 4 * 2 * -6);
    expect(res.discriminant).toBe(64);
  });

  it("handles a repeated root (discriminant == 0)", () => {
    const res = solveQuadratic(1, -2, 1); // (x-1)^2
    expect(res.discriminant).toBe(0);
    expect(res.roots.length).toBe(2);
    expect(within(res.roots[0], 1)).toBe(true);
    expect(within(res.roots[1], 1)).toBe(true);
  });

  it("returns no real roots for a negative discriminant", () => {
    const res = solveQuadratic(1, 0, 1); // x^2 + 1
    expect(res.degree).toBe(2);
    expect(res.roots).toEqual([]);
    expect(res.discriminant).toBe(-4);
  });

  it("edge case a=0: falls back to the linear solver", () => {
    const res = solveQuadratic(0, 2, -4); // 2x - 4 = 0 -> x = 2
    expect(res.degree).toBe(1);
    expect(res.discriminant).toBeNull();
    expect(res.roots.length).toBe(1);
    expect(within(res.roots[0], 2)).toBe(true);
  });

  it("edge case a=0,b=0 with c!=0: degenerate (contradiction)", () => {
    const res = solveQuadratic(0, 0, 5);
    expect(res).toEqual({ roots: [], discriminant: null, degree: 0 });
  });

  it("edge case all-zero coefficients: degenerate", () => {
    const res = solveQuadratic(0, 0, 0);
    expect(res).toEqual({ roots: [], discriminant: null, degree: 0 });
  });

  it("handles large coefficients without precision regressions", () => {
    // 1e6 x^2 - 3e6 x + 2e6 = 0 -> roots 1 and 2
    const res = solveQuadratic(1e6, -3e6, 2e6);
    expect(res.roots.length).toBe(2);
    expect(within(res.roots[0], 1)).toBe(true);
    expect(within(res.roots[1], 2)).toBe(true);
  });

  it("handles negative coefficients", () => {
    // -x^2 + 0x + 4 = 0 -> x^2 = 4 -> roots -2, 2 ascending
    const res = solveQuadratic(-1, 0, 4);
    expect(res.roots.length).toBe(2);
    expect(within(res.roots[0], -2)).toBe(true);
    expect(within(res.roots[1], 2)).toBe(true);
    expect(res.roots[0]).toBeLessThan(res.roots[1]);
  });
});
