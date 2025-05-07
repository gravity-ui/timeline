import { RulerOptions, TimeLineOptions } from "../types/options";
import { RulerLevel, RulerSupLevel } from "../types/ruler";
import { labelLevels } from "../constants/ruler";
import dayjs from "dayjs";
import { clamp, convertDomain } from "../helpers/math";
import { BaseComponent } from "./BaseComponent";
import { yaTimelineConfig } from "../config";
import { BaseComponentInterface } from "../types/component";

const defaultOptions: Required<RulerOptions> = {
  spacing: yaTimelineConfig.RULER_LABEL_SPACING,
  position: yaTimelineConfig.RULER_LABEL_POS,
  subPosition: yaTimelineConfig.RULER_SUP_LABEL_POS,
  height: yaTimelineConfig.RULER_HEADER_HEIGHT,
  font: yaTimelineConfig.RULER_FONT,
  color: {
    background: yaTimelineConfig.PRIMARY_BACKGROUND_COLOR,
    primaryLevel: yaTimelineConfig.RULER_PRIMARY_TEXT_COLOR,
    secondaryLevel: yaTimelineConfig.RULER_SECONDARY_TEXT_COLOR,
    textOutlineColor: yaTimelineConfig.RULER_TEXT_OUTLINE_COLOR,
    borderColor: yaTimelineConfig.RULER_BORDER_COLOR,
  },
};

export class Ruler extends BaseComponent implements BaseComponentInterface {
  private options: TimeLineOptions;

  /**
   * Creates a new Ruler component
   * @param canvas The canvas element to render on
   * @param options Timeline options including ruler configuration
   */
  constructor(canvas: HTMLCanvasElement, options: TimeLineOptions) {
    super(canvas);

    this.ctx = canvas.getContext("2d");
    if (!this.ctx) {
      throw new Error("Could not get 2D context from canvas");
    }

    this.options = {
      ...options,
      ruler: { ...defaultOptions, ...options.ruler },
    };

    this.updateWidth();
  }

  public render() {
    this.updateWidth();
    this.useStaticTransform();

    this.ctx.fillStyle = this.options.ruler.color.background;
    this.ctx.fillRect(0, 0, this.width, this.options.ruler.height);

    this.ctx.font = this.options.ruler.font;
    this.ctx.lineJoin = "miter";
    this.ctx.miterLimit = 2;
    this.ctx.lineWidth = 1;

    this.renderBottomLine();
    this.renderLevels();
  }

  /**
   * Draws the bottom border line of the ruler
   */
  private renderBottomLine() {
    // Use the configured border color instead of hardcoded value
    this.ctx.strokeStyle = this.options.ruler.color.borderColor;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.options.ruler.height + this.ctx.lineWidth / 2);
    this.ctx.lineTo(
      this.width,
      this.options.ruler.height + this.ctx.lineWidth / 2,
    );
    this.ctx.stroke();
  }

  /**
   * Draws the time labels on the ruler at appropriate scale levels
   */
  private renderLevels() {
    const domain = this.options.end - this.options.start;
    let level: RulerLevel | undefined;
    let supLevel: RulerSupLevel | undefined;

    for (let i = 0; i < labelLevels.length; i += 1) {
      if (domain > labelLevels[i].domain) continue;

      let marksWidth = 0;

      for (let t = dayjs(0); Number(t) < domain; t = labelLevels[i].step(t)) {
        const x = convertDomain(Number(t), 0, domain, 0, this.width);
        if (x > 0) marksWidth += this.options.ruler.spacing;
      }

      if (marksWidth > this.width) continue;

      level = labelLevels[i];
      supLevel = level.sup || labelLevels[i + 1];
      break;
    }

    if (level) {
      this.renderLevel(
        level,
        this.options.ruler.position,
        this.options.ruler.color.primaryLevel,
      );
    }

    if (supLevel) {
      this.renderLevel(
        supLevel,
        this.options.ruler.subPosition,
        this.options.ruler.color.secondaryLevel,
      );
    }
  }

  /**
   * Renders a level of time labels on the ruler
   * @param level The ruler level to render
   * @param y The vertical position for the labels
   * @param color The default color for the labels
   */
  private renderLevel(
    level: RulerLevel | RulerSupLevel,
    y: number,
    color: string,
  ) {
    this.ctx.strokeStyle = this.options.ruler.color.textOutlineColor;
    const t0 = level.start(this.options.start);
    let firstRendered = null;

    // Render labels that fall within the visible area
    for (let t = t0; Number(t) < this.options.end; t = level.step(t)) {
      const label = dayjs(t).format(level.format);
      const x = this.timeToPosition(t);

      if (x > 10 && x < this.width) {
        if (!firstRendered) firstRendered = t;
        this.ctx.fillStyle = (level.color && level.color(t)) || color;
        this.ctx.strokeText(label, x, y);
        this.ctx.fillText(label, x, y);
      }
    }

    // Render the first label that might be partially visible
    const firstLabelTimestamp = this.positionToTime(10);
    const firstLabel = dayjs(firstLabelTimestamp).format(level.format);
    const firstMark = clamp(
      10,
      -Infinity,
      this.timeToPosition(firstRendered || this.options.end) -
        this.ctx.measureText(firstLabel).width -
        5,
    );
    this.ctx.fillStyle =
      (level.color && level.color(firstLabelTimestamp)) || color;
    this.ctx.strokeText(firstLabel, firstMark, y);
    this.ctx.fillText(firstLabel, firstMark, y);
  }

  /**
   * Converts a timestamp to a horizontal position on the ruler
   * @param t The timestamp to convert (either as number or dayjs object)
   * @returns The x-coordinate on the ruler
   */
  private timeToPosition(t: number | dayjs.Dayjs) {
    return convertDomain(
      Number(t),
      this.options.start,
      this.options.end,
      0,
      this.width,
    );
  }

  /**
   * Converts a horizontal position on the ruler to a timestamp
   * @param x The x-coordinate on the ruler
   * @returns The corresponding timestamp
   */
  private positionToTime(x: number) {
    return convertDomain(
      x,
      0,
      this.width,
      this.options.start,
      this.options.end,
    );
  }
}
