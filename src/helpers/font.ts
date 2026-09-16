import { resolveCanvasCssVariable } from "./color";

/**
 * Resolves a canvas font value in the canvas CSS context.
 *
 * CanvasRenderingContext2D does not accept CSS-wide keywords or CSS custom
 * properties directly. `inherit` is a library sentinel for the computed font
 * of the canvas element.
 */
export const resolveCanvasFont = (
  font: string,
  canvas: HTMLCanvasElement,
  fallback = "10px sans-serif",
): string => {
  const resolved = resolveCanvasCssVariable(font, canvas, fallback);

  if (resolved !== "inherit") return resolved;

  return getComputedStyle(canvas).font || fallback;
};
