export function square(x: number): number {
  return x * x;
}

export function cube(x: number): number {
  return x * x * x;
}

export interface SolveResult {
  roots: number[];
  discriminant: number;
  degree: number;
}

const EPSILON = 1e-9;

function cleanZero(x: number): number {
  if (Math.abs(x) < EPSILON) {
    return 0;
  }
  // Snap values that are extremely close to an integer to remove
  // floating-point noise (e.g. 0.9999999999999998 -> 1).
  const rounded = Math.round(x);
  return Math.abs(x - rounded) < EPSILON ? rounded : x;
}

function cbrt(x: number): number {
  return x < 0 ? -Math.cbrt(-x) : Math.cbrt(x);
}

/**
 * Solve a quadratic equation `a·x² + b·x + c = 0` for its real roots.
 *
 * The number of roots depends on the sign of the discriminant
 * `D = b² − 4·a·c`:
 * - `D > 0`: two distinct real roots.
 * - `D === 0`: one repeated real root.
 * - `D < 0`: no real roots (`roots` is empty).
 *
 * Fallback behavior when `a === 0` (the equation is not truly quadratic):
 * - `b !== 0`: degenerates to the linear equation `b·x + c = 0`, returning the
 *   single root `-c / b` with `degree: 1`.
 * - `b === 0`: fully degenerate; returns no roots with `degree: 0`.
 *
 * @param a - Coefficient of the `x²` term. If `0`, falls back to linear/degenerate handling.
 * @param b - Coefficient of the `x` term.
 * @param c - Constant term.
 * @returns A {@link SolveResult} containing the sorted real `roots`, the
 *   `discriminant` (`0` for the linear/degenerate fallbacks), and the effective
 *   polynomial `degree` (`2`, `1`, or `0`).
 *
 * @example
 * // x² - 3x + 2 = 0  ->  roots [1, 2]
 * solveQuadratic(1, -3, 2);
 * // => { roots: [1, 2], discriminant: 1, degree: 2 }
 */
export function solveQuadratic(a: number, b: number, c: number): SolveResult {
  if (a === 0) {
    // Linear: bx + c = 0
    if (b === 0) {
      return { roots: [], discriminant: 0, degree: 0 };
    }
    return { roots: [cleanZero(-c / b)], discriminant: 0, degree: 1 };
  }

  // Discriminant: D = b² − 4·a·c
  const discriminant = cleanZero(square(b) - 4 * a * c);

  if (discriminant > 0) {
    const sqrtD = Math.sqrt(discriminant);
    const r1 = (-b + sqrtD) / (2 * a);
    const r2 = (-b - sqrtD) / (2 * a);
    return {
      roots: [cleanZero(r1), cleanZero(r2)].sort((x, y) => x - y),
      discriminant,
      degree: 2,
    };
  }

  if (discriminant === 0) {
    return { roots: [cleanZero(-b / (2 * a))], discriminant, degree: 2 };
  }

  return { roots: [], discriminant, degree: 2 };
}

/**
 * Solve a cubic equation `a·x³ + b·x² + c·x + d = 0` for its real roots.
 *
 * The equation is reduced to a depressed cubic `t³ + p·t + q = 0` via the
 * substitution `x = t − b/(3·a)`, then solved using the trigonometric method
 * (three real roots) or Cardano's method (one real root). The discriminant used
 * is that of the general cubic:
 * `D = 18·a·b·c·d − 4·b³·d + b²·c² − 4·a·c³ − 27·a²·d²`
 * which classifies the roots:
 * - `D > 0`: three distinct real roots.
 * - `D === 0`: a repeated root (a double root plus a single root, or a triple root).
 * - `D < 0`: exactly one real root.
 *
 * Fallback behavior:
 * - When `a === 0` the equation is not cubic and the call is delegated to
 *   {@link solveQuadratic} with `(b, c, d)`, which itself may further degenerate
 *   to linear or empty results.
 * - When `a < 0` all coefficients are negated first so the leading coefficient
 *   is positive, keeping the ordering of the returned roots consistent.
 *
 * @param a - Coefficient of the `x³` term. If `0`, falls back to {@link solveQuadratic}.
 * @param b - Coefficient of the `x²` term.
 * @param c - Coefficient of the `x` term.
 * @param d - Constant term.
 * @returns A {@link SolveResult} containing the sorted real `roots`, the cubic
 *   `discriminant`, and the polynomial `degree` (`3`, or the degree reported by
 *   the fallback when `a === 0`).
 *
 * @example
 * // x³ - 6x² + 11x - 6 = 0  ->  roots [1, 2, 3]
 * solveCubic(1, -6, 11, -6);
 * // => { roots: [1, 2, 3], discriminant: 4, degree: 3 }
 */
export function solveCubic(
  a: number,
  b: number,
  c: number,
  d: number
): SolveResult {
  // Fall back to quadratic when the leading coefficient is zero.
  if (a === 0) {
    return solveQuadratic(b, c, d);
  }

  // Normalize so the leading coefficient is positive to keep the ordering of
  // real roots consistent regardless of the sign of `a`.
  if (a < 0) {
    a = -a;
    b = -b;
    c = -c;
    d = -d;
  }

  // Depressed cubic: substitute x = t - b/(3a) to obtain t^3 + p t + q = 0.
  const p = (3 * a * c - square(b)) / (3 * square(a));
  const q = (2 * cube(b) - 9 * a * b * c + 27 * square(a) * d) / (27 * cube(a));
  const shift = b / (3 * a);

  // Discriminant of the cubic (uses square and cube helpers):
  // D = 18·a·b·c·d − 4·b³·d + b²·c² − 4·a·c³ − 27·a²·d²
  const discriminant = cleanZero(
    18 * a * b * c * d -
      4 * cube(b) * d +
      square(b) * square(c) -
      4 * a * cube(c) -
      27 * square(a) * square(d)
  );

  let roots: number[];

  if (discriminant > 0) {
    // Three distinct real roots (trigonometric method).
    const m = 2 * Math.sqrt(-p / 3);
    const acosArg = Math.max(-1, Math.min(1, (3 * q) / (p * m)));
    const theta = Math.acos(acosArg) / 3;
    roots = [
      m * Math.cos(theta) - shift,
      m * Math.cos(theta - (2 * Math.PI) / 3) - shift,
      m * Math.cos(theta - (4 * Math.PI) / 3) - shift,
    ].map(cleanZero);
  } else if (discriminant === 0) {
    // Repeated roots.
    if (Math.abs(p) < EPSILON && Math.abs(q) < EPSILON) {
      // Triple root: report the real root and its repeated value (two total).
      const triple = cleanZero(-shift);
      roots = [triple, triple];
    } else {
      const single = (3 * q) / p - shift;
      const double = (-3 * q) / (2 * p) - shift;
      roots = [cleanZero(single), cleanZero(double)];
    }
  } else {
    // One real root (Cardano's method).
    const sqrtTerm = Math.sqrt(square(q) / 4 + cube(p) / 27);
    const u = cbrt(-q / 2 + sqrtTerm);
    const v = cbrt(-q / 2 - sqrtTerm);
    roots = [cleanZero(u + v - shift)];
  }

  roots.sort((x, y) => x - y);
  return { roots, discriminant, degree: 3 };
}
