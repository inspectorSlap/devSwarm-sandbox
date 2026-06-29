import { square } from './square';
import { cube } from './cube';

export function sumPowers(n: number): number {
  return square(n) + cube(n);
}
