import { AbstractSectionRenderer } from "../components/Sections/AbstractSectionRenderer";
import { TimelineSection, ViewConfiguration } from "../types";
import { Hitbox } from "../components/Events/AbstractEventRenderer";

export type MySectionWithGradient = TimelineSection & {
  gradientDirection?: "horizontal" | "vertical";
  borderColor?: string;
  borderWidth?: number;
  pattern?: "dots" | "stripes" | "solid";
};

/**
 * Custom section renderer demonstrating advanced section visualization
 * Features:
 * - Gradient backgrounds
 * - Custom borders
 * - Pattern fills (dots, stripes)
 * - Enhanced hover effects
 */
export class MySectionRenderer extends AbstractSectionRenderer<MySectionWithGradient> {
  public render({
    ctx,
    section,
    x0,
    x1,
    y0,
    h,
    isHovered,
  }: {
    ctx: CanvasRenderingContext2D;
    section: MySectionWithGradient;
    x0: number;
    x1: number;
    y0: number;
    h: number;
    isHovered: boolean;
    viewConfiguration: ViewConfiguration;
    timeToPosition?: (n: number) => number;
  }) {
    const width = x1 - x0;
    const height = h;
    const startY = y0 - h / 2;

    // Save context for restoration
    ctx.save();

    // Create gradient or solid color
    let fillStyle: string | CanvasGradient;

    if (section.gradientDirection) {
      const gradient =
        section.gradientDirection === "horizontal"
          ? ctx.createLinearGradient(x0, startY, x1, startY)
          : ctx.createLinearGradient(x0, startY, x0, startY + height);

      const baseColor = isHovered
        ? section.hoverColor || section.color
        : section.color;

      // Create gradient with transparency
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(0.5, this.adjustColorOpacity(baseColor, 0.7));
      gradient.addColorStop(1, this.adjustColorOpacity(baseColor, 0.3));

      fillStyle = gradient;
    } else {
      fillStyle = isHovered
        ? section.hoverColor || section.color
        : section.color;
    }

    // Apply pattern if specified
    if (section.pattern && section.pattern !== "solid") {
      this.renderPattern(
        ctx,
        section.pattern,
        x0,
        startY,
        width,
        height,
        fillStyle,
      );
    } else {
      // Render solid/gradient background
      ctx.beginPath();
      ctx.fillStyle = fillStyle;
      ctx.rect(x0, startY, width, height);
      ctx.fill();
    }

    // Add border if specified
    if (section.borderColor && section.borderWidth) {
      ctx.beginPath();
      ctx.strokeStyle = section.borderColor;
      ctx.lineWidth = section.borderWidth;
      ctx.rect(x0, startY, width, height);
      ctx.stroke();
    }

    // Add hover glow effect
    if (isHovered) {
      ctx.beginPath();
      ctx.strokeStyle = this.adjustColorOpacity(section.color, 0.8);
      ctx.lineWidth = 2;
      ctx.rect(x0 - 1, startY - 1, width + 2, height + 2);
      ctx.stroke();
    }

    // Restore context
    ctx.restore();
  }

  public getHitbox(
    section: MySectionWithGradient,
    x0: number,
    x1: number,
  ): Hitbox {
    return {
      left: x0,
      right: x1,
      top: 0,
      bottom: 0,
    };
  }

  /**
   * Renders pattern fills for sections
   */
  private renderPattern(
    ctx: CanvasRenderingContext2D,
    pattern: "dots" | "stripes",
    x: number,
    y: number,
    width: number,
    height: number,
    baseColor: string | CanvasGradient,
  ) {
    // Fill base color first
    ctx.beginPath();
    ctx.fillStyle = baseColor;
    ctx.rect(x, y, width, height);
    ctx.fill();

    // Create clipping region
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    if (pattern === "dots") {
      this.renderDotPattern(ctx, x, y, width, height);
    } else if (pattern === "stripes") {
      this.renderStripePattern(ctx, x, y, width, height);
    }

    ctx.restore();
  }

  /**
   * Renders dot pattern overlay
   */
  private renderDotPattern(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    const dotSize = 2;
    const spacing = 8;

    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";

    for (let px = x; px < x + width; px += spacing) {
      for (let py = y; py < y + height; py += spacing) {
        ctx.beginPath();
        ctx.arc(px, py, dotSize, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }

  /**
   * Renders stripe pattern overlay
   */
  private renderStripePattern(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    const stripeWidth = 4;
    const spacing = 8;

    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";

    for (let px = x; px < x + width; px += spacing) {
      ctx.beginPath();
      ctx.rect(px, y, stripeWidth, height);
      ctx.fill();
    }
  }

  /**
   * Helper to adjust color opacity
   */
  private adjustColorOpacity(color: string, opacity: number): string {
    // Simple opacity adjustment for rgba colors
    if (color.startsWith("rgba")) {
      return color.replace(/[\d.]+\)$/g, `${opacity})`);
    } else if (color.startsWith("rgb")) {
      return color.replace("rgb", "rgba").replace(")", `, ${opacity})`);
    }

    // For hex colors, convert to rgba
    if (color.startsWith("#")) {
      const hex = color.substring(1);
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    return color;
  }
}
