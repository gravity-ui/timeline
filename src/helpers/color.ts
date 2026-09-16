const CSS_VARIABLE = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\s*\)$/;

/** Resolves a whole-value CSS custom property against the canvas element. */
export const resolveCanvasCssVariable = (
  value: string,
  canvas: HTMLCanvasElement,
  fallback: string,
): string => {
  if (!CSS_VARIABLE.test(value)) return value;

  const style = getComputedStyle(canvas);
  const visited = new Set<string>();

  const resolve = (currentValue: string, currentFallback: string): string => {
    const match = currentValue.match(CSS_VARIABLE);
    if (!match) return currentValue;

    const [, variableName, variableFallback] = match;
    if (visited.has(variableName)) return currentFallback;
    visited.add(variableName);

    const resolved = style.getPropertyValue(variableName).trim();
    return resolve(
      resolved || variableFallback || currentFallback,
      currentFallback,
    );
  };

  return resolve(value, fallback);
};

/**
 * Resolves a CSS custom property against the canvas element.
 *
 * Canvas contexts cannot resolve `var(--token)` themselves, while computed
 * styles do so in the correct inherited and scoped theme context.
 */
export const resolveCanvasColor = (
  color: string,
  canvas: HTMLCanvasElement,
  fallback = "transparent",
): string => {
  return resolveCanvasCssVariable(color, canvas, fallback);
};
