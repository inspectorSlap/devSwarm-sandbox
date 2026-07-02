export const square = (x: number): number => x * x;

export interface QuadraticResult {
  roots: number[];
  discriminant: number | null;
  degree: number;
}

export function solveQuadratic(a: number, b: number, c: number): QuadraticResult {
  if (a === 0) {
    if (b !== 0) {
      return { roots: [-c / b], discriminant: null, degree: 1 };
    }
    return { roots: [], discriminant: null, degree: 0 };
  }

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
