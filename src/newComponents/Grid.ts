import { convertDomain } from "../helpers/math";
import { TGridLevel } from "../types/grid";
import dayjs from "dayjs";
import { gridLevels } from "../constants/grid";
import { BaseComponentInterface } from "../types/component";
import { CanvasApi } from "../CanvasApi";

/**
 * Grid component responsible for rendering vertical grid lines on the timeline
 */
export class Grid implements BaseComponentInterface {
  private api: CanvasApi;

  constructor(api: CanvasApi) {
    this.api = api;
  }

  /**
   * Renders the grid on the canvas
   */
  public render() {
    this.api.useStaticTransform();
    const options = this.api.getVisualConfiguration();
    const { start, end } = this.api.getInterval();
    const { ctx, width } = this.api;

    const rulerHeight = options.ruler.height || 0;
    const left = 0;
    const top = rulerHeight;
    const height = ctx.canvas.height - rulerHeight;
    const domain = end - start;

    // Find the appropriate grid level based on domain size
    let level: TGridLevel | undefined;

    for (let i = 0, len = gridLevels.length; i < len; i += 1) {
      if (domain > gridLevels[i].domain) {
        continue;
      }

      // Calculate total width of marks to ensure they fit in the visible area
      // using reduce to accumulate the width
      const marksWidth = (() => {
        let t = dayjs(0);
        const timePoints = [];

        // Create array of time points
        while (Number(t) < domain) {
          timePoints.push(t);
          t = gridLevels[i].step(t);
        }

        // Use reduce to calculate total width
        return timePoints.reduce((width, time) => {
          const x = convertDomain(Number(time), 0, domain, left, left + width);
          return x > 0 ? width + options.grid.spacing : width;
        }, 0);
      })();

      if (marksWidth > width + 40) {
        continue;
      }

      level = gridLevels[i];
      break;
    }

    // Set up canvas drawing properties
    ctx.lineJoin = "miter";
    ctx.miterLimit = 2;
    ctx.lineWidth = 1;

    // If no suitable level was found, use the last level as fallback
    if (!level && gridLevels.length > 0) {
      level = gridLevels[gridLevels.length - 1];
    }

    // Only render if we have a valid level
    if (level) {
      this.renderLevel(top, left, width, height, level);
    }
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
