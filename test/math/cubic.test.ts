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

/** Degenerate case: 0 = 0 or a contradiction; no discrete real roots. */
export function solveDegenerate(): SolveResult {
  return { roots: [], discriminant: null, degree: 0 };
}

/** Linear: b*x + c = 0. Falls back to degenerate when b == 0. */
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
    return { roots: [], discriminant, degree: 2 };
  }

  if (Math.abs(discriminant) <= EPS) {
    const r = -b / (2 * a);
    return { roots: [r, r], discriminant, degree: 2 };
  }

  const sqrtD = Math.sqrt(discriminant);
  const r1 = (-b + sqrtD) / (2 * a);
  const r2 = (-b - sqrtD) / (2 * a);
  return { roots: [r1, r2].sort((x, y) => x - y), discriminant, degree: 2 };
}

const cbrt = (x: number): number =>
  x < 0 ? -Math.pow(-x, 1 / 3) : Math.pow(x, 1 / 3);

const clamp = (x: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, x));

/**
 * Cubic: a*x^3 + b*x^2 + c*x + d = 0.
 *
 * Delegates through the full fallback chain when the leading coefficient
 * vanishes: cubic -> quadratic -> linear -> degenerate.
 *
 * The reported discriminant is the standard cubic discriminant:
 *   Δ = 18abcd - 4b^3 d + b^2 c^2 - 4a c^3 - 27 a^2 d^2
 * Real roots are returned sorted in ascending order.
 */
export function solveCubic(
  a: number,
  b: number,
  c: number,
  d: number
): SolveResult {
  if (Math.abs(a) < EPS) {
    return solveQuadratic(b, c, d);
  }

  const discriminant =
    18 * a * b * c * d -
    4 * b * b * b * d +
    b * b * c * c -
    4 * a * c * c * c -
    27 * a * a * d * d;

  // Normalise to monic and depress: x = t - A/3, giving t^3 + p t + q = 0.
  const A = b / a;
  const B = c / a;
  const C = d / a;

  const p = B - (A * A) / 3;
  const q = (2 * A * A * A) / 27 - (A * B) / 3 + C;
  const shift = A / 3;

  let ts: number[];

  if (Math.abs(p) < EPS && Math.abs(q) < EPS) {
    // Triple root.
    ts = [0, 0, 0];
  } else {
    // Discriminant of the depressed cubic.
    const disc = (q * q) / 4 + (p * p * p) / 27;

    if (disc > EPS) {
      // One real root.
      const sqrtDisc = Math.sqrt(disc);
      const u = cbrt(-q / 2 + sqrtDisc);
      const v = cbrt(-q / 2 - sqrtDisc);
      ts = [u + v];
    } else if (disc < -EPS) {
      // Three distinct real roots (trigonometric method).
      const m = 2 * Math.sqrt(-p / 3);
      const arg = clamp((3 * q) / (p * m), -1, 1);
      const theta = Math.acos(arg) / 3;
      ts = [
        m * Math.cos(theta),
        m * Math.cos(theta - (2 * Math.PI) / 3),
        m * Math.cos(theta - (4 * Math.PI) / 3),
      ];
    } else {
      // disc ~ 0: a multiple root exists.
      if (Math.abs(p) < EPS) {
        const t = cbrt(-q);
        ts = [t, t, t];
      } else {
        const single = (3 * q) / p; // simple root
        const double = (-3 * q) / (2 * p); // double root
        ts = [single, double, double];
      }
    }
  }

  const roots = ts.map((t) => t - shift).sort((x, y) => x - y);
  return { roots, discriminant, degree: 3 };
}

const within = (actual: number, expected: number, tol = 1e-10) =>
  Math.abs(actual - expected) <= tol;

const rootsMatch = (roots: number[], expected: number[], tol = 1e-10) => {
  expect(roots.length).toBe(expected.length);
  const sorted = [...expected].sort((x, y) => x - y);
  roots.forEach((r, i) => expect(within(r, sorted[i], tol)).toBe(true));
};

const isAscending = (roots: number[]) =>
  roots.every((r, i) => i === 0 || roots[i - 1] <= r);

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

describe("cubic solver", () => {
  it("qa-output-shape [contract]: every return value has exactly { roots, discriminant, degree }", () => {
    const cases: SolveResult[] = [
      solveCubic(1, -6, 11, -6), // three real roots
      solveCubic(1, 0, 0, -1), // one real root
      solveCubic(1, -3, 3, -1), // triple root
      solveCubic(0, 1, -3, 2), // quadratic fallback
      solveCubic(0, 0, 2, -4), // linear fallback
      solveCubic(0, 0, 0, 0), // degenerate fallback
    ];
    cases.forEach(expectResultShape);
  });

  it("qa-precision [unit]: roots within 1e-10 of analytical values for known cubics", () => {
    // (x-1)(x-2)(x-3) = x^3 - 6x^2 + 11x - 6
    rootsMatch(solveCubic(1, -6, 11, -6).roots, [1, 2, 3]);

    // (x+1)(x+2)(x+3) = x^3 + 6x^2 + 11x + 6
    rootsMatch(solveCubic(1, 6, 11, 6).roots, [-3, -2, -1]);

    // (x-2)(x^2+1): only x=2 real -> x^3 - 2x^2 + x - 2
    rootsMatch(solveCubic(1, -2, 1, -2).roots, [2]);

    // x^3 - 1 = 0 -> single real root 1
    rootsMatch(solveCubic(1, 0, 0, -1).roots, [1]);

    // (x-5)^3 = x^3 - 15x^2 + 75x - 125 (triple root)
    rootsMatch(solveCubic(1, -15, 75, -125).roots, [5, 5, 5]);

    // (x+4)(x-1)(x-1) = x^3 + 2x^2 - 7x + 4 (double root at 1)
    rootsMatch(solveCubic(1, 2, -7, 4).roots, [-4, 1, 1]);
  });

  it("returns real roots sorted in ascending order", () => {
    const res = solveCubic(1, -6, 11, -6);
    expect(res.degree).toBe(3);
    expect(isAscending(res.roots)).toBe(true);
    expect(within(res.roots[0], 1)).toBe(true);
    expect(within(res.roots[2], 3)).toBe(true);
  });

  it("validates the cubic discriminant against the known formula", () => {
    // For (x-1)(x-2)(x-3): distinct real roots => positive discriminant.
    const res = solveCubic(1, -6, 11, -6);
    // Δ = product over pairs of (ri-rj)^2 = ((1-2)(1-3)(2-3))^2 = 4
    expect(within(res.discriminant as number, 4)).toBe(true);
    expect((res.discriminant as number) > 0).toBe(true);

    // Triple root => discriminant 0.
    const triple = solveCubic(1, -15, 75, -125);
    expect(within(triple.discriminant as number, 0)).toBe(true);

    // One real + two complex => negative discriminant.
    const one = solveCubic(1, 0, 0, -1); // x^3 - 1
    expect((one.discriminant as number) < 0).toBe(true);
    expect(within(one.discriminant as number, -27)).toBe(true);
  });

  it("qa-fallback-chain [integration]: delegates cubic -> quadratic -> linear -> degenerate", () => {
    // a=0 -> quadratic: x^2 - 3x + 2 -> roots 1, 2
    const quad = solveCubic(0, 1, -3, 2);
    expect(quad.degree).toBe(2);
    rootsMatch(quad.roots, [1, 2]);
    expect(quad.discriminant).toBe(1); // (-3)^2 - 4*1*2

    // a=0,b=0 -> linear: 2x - 4 -> root 2
    const lin = solveCubic(0, 0, 2, -4);
    expect(lin.degree).toBe(1);
    expect(lin.discriminant).toBeNull();
    rootsMatch(lin.roots, [2]);

    // a=0,b=0,c=0,d!=0 -> degenerate (contradiction)
    const deg = solveCubic(0, 0, 0, 7);
    expect(deg).toEqual({ roots: [], discriminant: null, degree: 0 });

    // all-zero -> degenerate
    const allZero = solveCubic(0, 0, 0, 0);
    expect(allZero).toEqual({ roots: [], discriminant: null, degree: 0 });
  });

  it("edge case: large coefficients keep precision", () => {
    // 1e6 * (x-1)(x-2)(x-3)
    const res = solveCubic(1e6, -6e6, 11e6, -6e6);
    rootsMatch(res.roots, [1, 2, 3]);
    expect(isAscending(res.roots)).toBe(true);
  });

  it("edge case: negative leading coefficient", () => {
    // -(x-1)(x-2)(x-3) = -x^3 + 6x^2 - 11x + 6
    const res = solveCubic(-1, 6, -11, 6);
    rootsMatch(res.roots, [1, 2, 3]);
    expect(isAscending(res.roots)).toBe(true);
  });

  it("edge case: negative coefficients throughout", () => {
    // (x+1)(x+2)(x+3) with all-negative expansion sign handled
    const res = solveCubic(-1, -6, -11, -6);
    rootsMatch(res.roots, [-3, -2, -1]);
    expect(isAscending(res.roots)).toBe(true);
  });
});
