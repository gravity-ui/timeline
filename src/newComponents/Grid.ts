import { convertDomain } from "../helpers/math";
import { TGridLevel } from "../types/grid";
import dayjs from "dayjs";
import { getGridLevels } from "../constants/grid";
import { BaseComponentInterface } from "../types/component";
import { CanvasApi } from "../CanvasApi";

/**
 * Grid component responsible for rendering vertical grid lines on the timeline
 */
export class Grid implements BaseComponentInterface {
  private api: CanvasApi;
  private levels: TGridLevel[];

  constructor(api: CanvasApi) {
    this.api = api;
    this.levels = getGridLevels(this.api.getVisualConfiguration().grid);
  }

  /**
   * Renders the grid on the canvas
   */
  public render() {
    this.api.useStaticTransform();
    const { ruler } = this.api.getVisualConfiguration();
    const { start, end } = this.api.getInterval();
    const { ctx, width } = this.api;
    const domainSize = end - start;

    // Get the appropriate grid level
    const level = this.selectGridLevel(domainSize, width);
    if (!level) return;

    // Set up the drawing area
    this.api.useStaticTransform();
    const rulerHeight = ruler.height || 0;
    const top = rulerHeight;
    const height = ctx.canvas.height - rulerHeight;

    // Render the selected level
    this.renderLevel(top, 0, width, height, level);
  }

  /**
   * Selects the appropriate grid level based on domain size and canvas width
   */
  private selectGridLevel(
    domainSize: number,
    canvasWidth: number,
  ): TGridLevel | null {
    if (!this.levels.length) return null;

    for (const level of this.levels) {
      if (domainSize > level.domain) continue;

      // Check if the marks fit within the visible area
      if (
        this.calculateMarksWidth(level, domainSize) >
        canvasWidth + this.api.getVisualConfiguration().grid.widthBuffer
      ) {
        continue;
      }

      return level;
    }

    // Return the coarsest level as fallback
    return this.levels[this.levels.length - 1];
  }

  /**
   * Calculates the total width that the level's marks will occupy
   */
  private calculateMarksWidth(level: TGridLevel, domainSize: number): number {
    let time = dayjs(0);
    let totalWidth = 0;

    while (Number(time) < domainSize) {
      const x = convertDomain(Number(time), 0, domainSize, 0, totalWidth);
      totalWidth += x > 0 ? this.api.getVisualConfiguration().grid.spacing : 0;
      time = level.step(time);
    }

    return totalWidth;
  }

  /**
   * Renders a specific grid level with vertical lines
   */
  private renderLevel(
    top: number,
    left: number,
    width: number,
    height: number,
    level: TGridLevel,
  ) {
    const { grid } = this.api.getVisualConfiguration();
    const { start, end } = this.api.getInterval();
    const { ctx } = this.api;
    ctx.lineWidth = grid.lineWidth;

    // Draw vertical grid lines for each time point in the visible range
    for (let t = level.start(start); Number(t) < end; t = level.step(t)) {
      const x = Math.floor(
        convertDomain(Number(t), start, end, left, left + width),
      );
      ctx.beginPath();
      ctx.strokeStyle = level.style(t);
      ctx.moveTo(x, top);
      ctx.lineTo(x, top + height);
      ctx.stroke();
    }
  }
}
