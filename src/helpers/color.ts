const CSS_VARIABLE_COLOR = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\s*\)$/;

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
  if (!CSS_VARIABLE_COLOR.test(color)) return color;

  const style = getComputedStyle(canvas);
  const visited = new Set<string>();

  const resolve = (value: string, valueFallback: string): string => {
    const match = value.match(CSS_VARIABLE_COLOR);
    if (!match) return value;

    const [, variableName, variableFallback] = match;
    if (visited.has(variableName)) return valueFallback;
    visited.add(variableName);

    const resolved = style.getPropertyValue(variableName).trim();
    return resolve(
      resolved || variableFallback || valueFallback,
      valueFallback,
    );
  };

  return resolve(color, fallback);
};
