export function isMac() {
  return navigator.userAgent.indexOf("Mac OS") !== -1;
}

export function checkControlCommandKey(event: MouseEvent | KeyboardEvent) {
  return isMac() ? event.metaKey : event.ctrlKey;
}

/**
 * Deep merge two objects
 * @param target - The target object (defaults)
 * @param source - The source object (overrides)
 * @returns A new object with deep merged values
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Record<string, any>,
): T {
  const result: any = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue;
      }
    }
  }

  return result as T;
}
