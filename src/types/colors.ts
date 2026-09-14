/** Resolves a CSS color into a value supported by CanvasRenderingContext2D. */
export type CanvasColorResolver = (color: string, fallback?: string) => string;
