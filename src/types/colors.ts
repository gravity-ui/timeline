/** Resolves a CSS color into a value supported by CanvasRenderingContext2D. */
export type CanvasColorResolver = (color: string, fallback?: string) => string;

/** Resolves a CSS font value into a value supported by CanvasRenderingContext2D. */
export type CanvasFontResolver = (font: string, fallback?: string) => string;
