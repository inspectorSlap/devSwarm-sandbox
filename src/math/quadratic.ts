export const square = (x: number): number => x * x;

export interface QuadraticResult {
  roots: number[];
  discriminant: number | null;
  degree: number;
}

/**
 * Solve a quadratic equation `a·x² + b·x + c = 0` for its real roots.
 *
 * The number and nature of the roots is determined by the discriminant
 * `D = b² − 4·a·c`:
 * - `D > 0`: two distinct real roots.
 * - `D === 0`: one repeated real root.
 * - `D < 0`: no real roots (`roots` is empty).
 *
 * Fallback behavior when `a === 0` (the equation is not truly quadratic):
 * - `b !== 0`: degenerates to the linear equation `b·x + c = 0`, returning the
 *   single root `-c / b` with `degree: 1` and `discriminant: null`.
 * - `b === 0`: fully degenerate; returns no roots with `degree: 0` and
 *   `discriminant: null`.
 *
 * @param a - Coefficient of the `x²` term. If `0`, falls back to linear/degenerate handling.
 * @param b - Coefficient of the `x` term.
 * @param c - Constant term.
 * @returns A {@link QuadraticResult} containing the sorted real `roots`, the
 *   `discriminant` (`null` for the linear/degenerate fallbacks), and the
 *   effective polynomial `degree` (`2`, `1`, or `0`).
 *
 * @example
 * // x² - 3x + 2 = 0  ->  roots [1, 2]
 * solveQuadratic(1, -3, 2);
 * // => { roots: [1, 2], discriminant: 1, degree: 2 }
 */
export function solveQuadratic(a: number, b: number, c: number): QuadraticResult {
  if (a === 0) {
    if (b !== 0) {
      return { roots: [-c / b], discriminant: null, degree: 1 };
    }
    return { roots: [], discriminant: null, degree: 0 };
  }

  // Discriminant: D = b² − 4·a·c
  const discriminant = square(b) - 4 * a * c;

  if (discriminant > 0) {
    const sqrtD = Math.sqrt(discriminant);
    const r1 = (-b - sqrtD) / (2 * a);
    const r2 = (-b + sqrtD) / (2 * a);
    return { roots: [r1, r2].sort((x, y) => x - y), discriminant, degree: 2 };
  }

  if (discriminant === 0) {
    return { roots: [-b / (2 * a)], discriminant, degree: 2 };
  }

  return { roots: [], discriminant, degree: 2 };
}
