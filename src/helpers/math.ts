/**
 * Checks if a point is within a range (inclusive).
 * @param {number} point - The point to check
 * @param {number} x0 - The start of the range
 * @param {number} x1 - The end of the range
 * @returns {boolean} True if the point is within the range, false otherwise
 */
export function pointToRangeIntersect(
  point: number,
  x0: number,
  x1: number,
): boolean {
  return point >= x0 && point <= x1;
}

/**
 * Checks if two ranges intersect.
 * @param {number} a0 - The start of the first range
 * @param {number} a1 - The end of the first range
 * @param {number} b0 - The start of the second range
 * @param {number} b1 - The end of the second range
 * @returns {boolean} True if the ranges intersect, false otherwise
 */
export function rangeToRangeIntersect(
  a0: number,
  a1: number,
  b0: number,
  b1: number,
): boolean {
  return a1 - a0 > b1 - b0
    ? pointToRangeIntersect(b0, a0, a1) || pointToRangeIntersect(b1, a0, a1)
    : pointToRangeIntersect(a0, b0, b1) || pointToRangeIntersect(a1, b0, b1);
}

/**
 * Calculates the ratio of a value within a domain.
 * @param {number} value - The value to calculate the ratio for
 * @param {number} x0 - The start of the domain
 * @param {number} x1 - The end of the domain
 * @returns {number} The ratio of the value within the domain (0 to 1)
 */
export function getRatio(value: number, x0: number, x1: number): number {
  const domain = Math.abs(x1 - x0);
  return x0 < x1 ? (value - x0) / domain : (value - x1) / domain;
}

/**
 * Converts a value from one domain to another, with an optional transformation function.
 * @param {number} value - The value to convert
 * @param {number} src0 - The start of the source domain
 * @param {number} src1 - The end of the source domain
 * @param {number} dst0 - The start of the destination domain
 * @param {number} dst1 - The end of the destination domain
 * @param {Function} fn - Optional transformation function to apply to the ratio (defaults to identity function)
 * @returns {number} The converted value in the destination domain
 */
export function convertDomain(
  value: number,
  src0: number,
  src1: number,
  dst0: number,
  dst1: number,
  fn: (x: number) => number = (x) => x,
): number {
  const dstDomain = Math.abs(dst1 - dst0);
  const ratio = getRatio(value, src0, src1);
  return dst0 < dst1
    ? dst0 + fn(ratio) * dstDomain
    : dst1 + fn(1 - ratio) * dstDomain;
}

/**
 * Restricts a value to be within a specified range.
 * Uses direct comparison operators instead of Math.min/max for potential performance benefits.
 * @param {number} value - The value to clamp
 * @param {number} min - The lower boundary of the range
 * @param {number} max - The upper boundary of the range
 * @returns {number} The clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  // if operators are faster than Math.min/max

  if (value > max) {
    return max;
  }
  if (value < min) {
    return min;
  }

  return value;
}

/**
 * Aligns a number to a specific step by removing the remainder.
 * Effectively rounds down to the nearest multiple of the step.
 * @param {number} value - The value to align
 * @param {number} step - The step size to align to
 * @returns {number} The aligned value
 */
export function alignNumber(value: number, step: number): number {
  return value - (value % step);
}

/**
 * Checks if two numbers are approximately equal within a specified epsilon.
 * Useful for floating-point comparisons where exact equality might not work due to precision issues.
 * @param {number} value - The value to compare
 * @param {number} target - The target value to compare against
 * @param {number} [epsilon] - The maximum allowed difference between the values
 * @returns {boolean} True if the values are approximately equal, false otherwise
 */
export function inexactEqual(
  value: number,
  target: number,
  epsilon = 0.01,
): boolean {
  return value >= target - epsilon && value <= target + epsilon;
}
