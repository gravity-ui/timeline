import { BaseComponent } from "./BaseComponent";
import { GridOptions, TimeLineOptions } from "../types/options";
import { yaTimelineConfig } from "../config";
import { convertDomain } from "../helpers/math";
import { TGridLevel } from "../types/grid";
import dayjs from "dayjs";
import { gridLevels } from "../constants/grid";
import { BaseComponentInterface } from "../types/component";

const defaultOptions: GridOptions = {
  spacing: yaTimelineConfig.RULER_LABEL_SPACING,
  lineWidth: yaTimelineConfig.GRID_STROKE_WIDTH,
};

/**
 * Grid component responsible for rendering vertical grid lines on the timeline
 */
export class Grid extends BaseComponent implements BaseComponentInterface {
  private options: TimeLineOptions;

  /**
   * Creates a new Grid component
   * @param canvas The canvas element to render on
   * @param options Timeline options including grid configuration
   */
  constructor(canvas: HTMLCanvasElement, options: TimeLineOptions) {
    super(canvas);
    this.ctx = canvas.getContext("2d");
    if (!this.ctx) {
      throw new Error("Could not get 2D context from canvas");
    }
    this.options = { ...options, grid: { ...defaultOptions, ...options.grid } };
  }

  /**
   * Renders the grid on the canvas
   */
  public render() {
    this.updateWidth();
    this.useStaticTransform();

    const rulerHeight = this.options?.ruler?.height || 0;
    const left = 0;
    const top = rulerHeight;
    const height = this.ctx.canvas.height - rulerHeight;
    const domain = this.options.end - this.options.start;

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
          const x = convertDomain(
            Number(time),
            0,
            domain,
            left,
            left + this.width,
          );
          return x > 0 ? width + this.options.grid.spacing : width;
        }, 0);
      })();

      if (marksWidth > this.width + 40) {
        continue;
      }

      level = gridLevels[i];
      break;
    }

    // Set up canvas drawing properties
    this.ctx.lineJoin = "miter";
    this.ctx.miterLimit = 2;
    this.ctx.lineWidth = 1;

    // If no suitable level was found, use the last level as fallback
    if (!level && gridLevels.length > 0) {
      level = gridLevels[gridLevels.length - 1];
    }

    // Only render if we have a valid level
    if (level) {
      this.renderLevel(top, left, this.width, height, level);
    }
  }

  /**
   * Renders a specific grid level with vertical lines
   * @param top The top position of the grid
   * @param left The left position of the grid
   * @param width The width of the grid
   * @param height The height of the grid
   * @param level The grid level to render
   */
  private renderLevel(
    top: number,
    left: number,
    width: number,
    height: number,
    level: TGridLevel,
  ) {
    this.ctx.lineWidth = this.options.grid.lineWidth;

    // Draw vertical grid lines for each time point in the visible range
    for (
      let t = level.start(this.options.start);
      Number(t) < this.options.end;
      t = level.step(t)
    ) {
      const x = Math.floor(
        convertDomain(
          Number(t),
          this.options.start,
          this.options.end,
          left,
          left + width,
        ),
      );
      this.ctx.beginPath();
      this.ctx.strokeStyle = level.style(t);
      this.ctx.moveTo(x, top);
      this.ctx.lineTo(x, top + height);
      this.ctx.stroke();
    }
  }
}
