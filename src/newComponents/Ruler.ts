import { RulerLevel, RulerSupLevel } from "../types/ruler";
import { labelLevels } from "../constants/ruler";
import dayjs from "dayjs";
import { clamp, convertDomain } from "../helpers/math";
import { BaseComponentInterface } from "../types/component";
import { Timeline } from "../Timeline";
import { CanvasApi } from "../CanvasApi";

export class Ruler implements BaseComponentInterface {
  private timeline: Timeline;
  private api: CanvasApi;

  constructor(timeline: Timeline) {
    this.timeline = timeline;
    this.api = timeline.api;
  }

  public render() {
    const options = this.timeline.viewConfiguration.ruler;
    const { ctx, width } = this.api;
    this.api.useStaticTransform();

    ctx.fillStyle = options.color.background;
    ctx.fillRect(0, 0, width, options.height);

    ctx.font = options.font;
    ctx.lineJoin = "miter";
    ctx.miterLimit = 2;
    ctx.lineWidth = 1;

    this.renderBottomLine();
    this.renderLevels();
  }

  private renderBottomLine() {
    const options = this.timeline.viewConfiguration.ruler;
    const { ctx, width } = this.api;

    ctx.strokeStyle = options.color.borderColor;
    ctx.beginPath();
    ctx.moveTo(0, options.height + ctx.lineWidth / 2);
    ctx.lineTo(width, options.height + ctx.lineWidth / 2);
    ctx.stroke();
  }

  private renderLevels() {
    const { start, end } = this.api.getInterval();
    const { ruler } = this.api.getVisualConfiguration();
    const { width } = this.api;

    const domain = end - start;

    let level: RulerLevel | undefined;
    let supLevel: RulerSupLevel | undefined;

    for (let i = 0; i < labelLevels.length; i += 1) {
      if (domain > labelLevels[i].domain) continue;

      let marksWidth = 0;
      for (let t = dayjs(0); Number(t) < domain; t = labelLevels[i].step(t)) {
        const x = convertDomain(Number(t), 0, domain, 0, width);
        if (x > 0) marksWidth += ruler.spacing;
      }

      if (marksWidth > width) continue;

      level = labelLevels[i];
      supLevel = level.sup || labelLevels[i + 1];
      break;
    }

    if (level) {
      this.renderLevel(level, ruler.position, ruler.color.primaryLevel);
    }

    if (supLevel) {
      this.renderLevel(supLevel, ruler.subPosition, ruler.color.secondaryLevel);
    }
  }

  private renderLevel(
    level: RulerLevel | RulerSupLevel,
    y: number,
    color: string,
  ) {
    const options = this.timeline.viewConfiguration.ruler;
    const { start, end } = this.api.getInterval();
    const { ctx, width } = this.api;

    ctx.strokeStyle = options.color.textOutlineColor;
    const t0 = level.start(start);
    let firstRendered = null;

    // Render labels that fall within the visible area
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

    // Render the first label that might be partially visible
    const firstLabelTimestamp = this.positionToTime(10);
    const firstLabel = dayjs(firstLabelTimestamp).format(level.format);
    const firstMark = clamp(
      10,
      -Infinity,
      this.timeToPosition(firstRendered || end) -
        ctx.measureText(firstLabel).width -
        5,
    );
    ctx.fillStyle = (level.color && level.color(firstLabelTimestamp)) || color;
    ctx.strokeText(firstLabel, firstMark, y);
    ctx.fillText(firstLabel, firstMark, y);
  }

  private timeToPosition(t: number | dayjs.Dayjs) {
    const { start, end } = this.api.getInterval();
    return convertDomain(Number(t), start, end, 0, this.api.width);
  }

  private positionToTime(x: number) {
    const { start, end } = this.api.getInterval();
    return convertDomain(x, 0, this.api.width, start, end);
  }
}
