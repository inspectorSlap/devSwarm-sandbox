/**
 * Converts Celsius to Fahrenheit.
 * @param celsius - Temperature in Celsius.
 * @returns Temperature in Fahrenheit, rounded to 2 decimal places.
 */
export function celsiusToFahrenheit(celsius: number): number {
  return Math.round(((celsius * 9/5) + 32) * 100) / 100;
}

/**
 * Converts Fahrenheit to Celsius.
 * @param fahrenheit - Temperature in Fahrenheit.
 * @returns Temperature in Celsius, rounded to 2 decimal places.
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return Math.round(((fahrenheit - 32) * 5/9) * 100) / 100;
}