import { RulerLevel, RulerSupLevel } from "../types/ruler";
import { getLabelLevels } from "../constants/ruler";
import dayjs from "dayjs";
import { clamp, convertDomain } from "../helpers/math";
import { BaseComponentInterface } from "../types/component";
import { CanvasApi } from "../CanvasApi";

export class Ruler implements BaseComponentInterface {
  private api: CanvasApi;
  private levelCache = new Map<RulerLevel, number>();
  private labelLevels: RulerLevel[];

  constructor(api: CanvasApi) {
    this.api = api;
    this.labelLevels = getLabelLevels(this.api.getVisualConfiguration().ruler);
  }

  public render() {
    const { ruler } = this.api.getVisualConfiguration();
    const { ctx, width } = this.api;
    this.api.useStaticTransform();

    // Draw background
    ctx.fillStyle = ruler.color.background;
    ctx.fillRect(0, 0, width, ruler.height);

    // Set common text properties
    ctx.font = ruler.font;
    ctx.lineJoin = "miter";
    ctx.miterLimit = 2;
    ctx.lineWidth = 1;

    this.renderBottomLine();
    this.renderLevels();
  }

  /**
   * Renders the bottom border line of the ruler
   */
  private renderBottomLine() {
    const { ruler } = this.api.getVisualConfiguration();
    const { ctx, width } = this.api;

    ctx.strokeStyle = ruler.color.borderColor;
    ctx.beginPath();
    ctx.moveTo(0, ruler.height + ctx.lineWidth / 2);
    ctx.lineTo(width, ruler.height + ctx.lineWidth / 2);
    ctx.stroke();
  }

  /**
   * Selects and renders appropriate time marking levels
   */
  private renderLevels() {
    const { start, end } = this.api.getInterval();
    const { ruler } = this.api.getVisualConfiguration();
    if (!ruler) return;

    const domain = end - start;
    const { width } = this.api;

    const { level, supLevel } = this.findAppropriateLevels(domain, width);

    if (level) {
      this.renderLevel(level, ruler.position, ruler.color.primaryLevel);
    }
    if (supLevel) {
      this.renderLevel(supLevel, ruler.subPosition, ruler.color.secondaryLevel);
    }
  }

  /**
   * Finds appropriate primary and secondary levels for current zoom level
   */
  private findAppropriateLevels(domain: number, width: number) {
    let level: RulerLevel | undefined;
    let supLevel: RulerSupLevel | undefined;

    for (const currentLevel of this.labelLevels) {
      if (domain > currentLevel.domain) continue;

      // Calculate or get cached marks width
      let marksWidth = this.levelCache.get(currentLevel);
      if (marksWidth === undefined) {
        marksWidth = this.calculateMarksWidth(currentLevel, domain, width);
        this.levelCache.set(currentLevel, marksWidth);
      }

      if (marksWidth > width) continue;

      level = currentLevel;
      supLevel =
        level.sup ||
        this.labelLevels[this.labelLevels.indexOf(currentLevel) + 1];
      break;
    }

    return { level, supLevel };
  }

  /**
   * Calculates total width required for level's marks
   */
  private calculateMarksWidth(
    level: RulerLevel,
    domain: number,
    width: number,
  ): number {
    const { ruler } = this.api.getVisualConfiguration();
    let marksWidth = 0;

    for (let t = dayjs(0); Number(t) < domain; t = level.step(t)) {
      const x = convertDomain(Number(t), 0, domain, 0, width);
      if (x > 0) marksWidth += ruler.spacing;
    }

    return marksWidth;
  }

  /**
   * Renders a single level of time markings
   * @param level - Level configuration
   * @param y - Vertical position
   * @param color - Default text color
   */
  private renderLevel(
    level: RulerLevel | RulerSupLevel,
    y: number,
    color: string,
  ) {
    const { ruler } = this.api.getVisualConfiguration();
    const { start, end } = this.api.getInterval();
    const { ctx, width } = this.api;

    ctx.strokeStyle = ruler.color.textOutlineColor;
    const t0 = level.start(start);
    let firstRendered = null;

    // Render fully visible labels
    for (let t = t0; Number(t) < end; t = level.step(t)) {
      const label = dayjs(t).format(level.format);
      const x = this.timeToPosition(t);

      if (x > 10 && x < width) {
        if (!firstRendered) firstRendered = t;
        ctx.fillStyle = (level.color && level.color(t)) || color;
        ctx.strokeText(label, x, y);
        ctx.fillText(label, x, y);
      }
    }

    // Render edge label if partially visible
    this.renderEdgeLabel(level, y, color, firstRendered);
  }

  /**
   * Renders partially visible label at the edge of visible area
   */
  private renderEdgeLabel(
    level: RulerLevel | RulerSupLevel,
    y: number,
    color: string,
    firstRendered: dayjs.Dayjs | null,
  ) {
    const { ctx } = this.api;
    const firstLabelTimestamp = this.positionToTime(10);
    const firstLabel = dayjs(firstLabelTimestamp).format(level.format);

    const firstMark = clamp(
      10,
      -Infinity,
      this.timeToPosition(firstRendered || this.api.getInterval().end) -
        ctx.measureText(firstLabel).width -
        5,
    );

    ctx.fillStyle = (level.color && level.color(firstLabelTimestamp)) || color;
    ctx.strokeText(firstLabel, firstMark, y);
    ctx.fillText(firstLabel, firstMark, y);
  }

  /**
   * Converts time value to horizontal position
   */
  private timeToPosition(t: number | dayjs.Dayjs): number {
    const { start, end } = this.api.getInterval();
    return convertDomain(Number(t), start, end, 0, this.api.width);
  }

  /**
   * Converts horizontal position to time value
   */
  private positionToTime(x: number): number {
    const { start, end } = this.api.getInterval();
    return convertDomain(x, 0, this.api.width, start, end);
  }
}
