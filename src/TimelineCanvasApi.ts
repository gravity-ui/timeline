import {alignNumber, convertDomain} from "./helpers/math";
import {YaTimeline} from "./YaTimeline";
import {TimelineComponent} from "./components/TimelineComponent";
import {yaTimelineConfig} from "./config";
import {Constructor, SECOND} from "./definitions"; 

export class TimelineCanvasApi {
  constructor(options: {
    timeline: YaTimeline;
    notifyBoundsChanged: (start: number, end: number) => void;
    notifyScrollTopChanged: (scrollTop: number) => void;
  }) {
    Object.assign(this, options);

    this.canvas = options.timeline.renderRoot.querySelector("canvas")!;
    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.globalAlpha = 1.0;
  }

  readonly canvas: HTMLCanvasElement;

  readonly ctx: CanvasRenderingContext2D;

  get pixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  get canvasScrollTop(): number {
    return this.timeline.canvasScrollTop || 0;
  }

  get start(): number {
    return this.timeline.start;
  }

  get end(): number {
    return this.timeline.end;
  }

  get width(): number {
    return this.canvas.width / this.pixelRatio;
  }

  get height(): number {
    return this.canvas.height / this.pixelRatio;
  }

  get currentTime(): number {
    return alignNumber(Date.now(), SECOND);
  }

  timeToPosition(t: number): number {
    const actualWidth = this.width;
    return convertDomain(t, this.timeline.start, this.timeline.end, 0, actualWidth) || 0;
  }

  positionToTime(px: number): number {
    return convertDomain(px, 0, this.width, this.timeline.start, this.timeline.end);
  }

  widthToTime(px: number): number {
    return this.positionToTime(px) - this.start;
  }

  clear(): void {
    this.ctx.fillStyle = yaTimelineConfig.resolveCssValue(yaTimelineConfig.PRIMARY_BACKGROUND_COLOR);
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  useStaticTransform(): void {
    const dpr = this.pixelRatio;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  useScrollTransform(): void {
    const dpr = this.pixelRatio;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, -this.canvasScrollTop * dpr);
  }

  getComponent<T extends TimelineComponent>(componentConstructor: Constructor<T>): T | undefined {
    return this.timeline.getComponentUnsafe(componentConstructor);
  }

  readonly notifyBoundsChanged!: (start: number, end: number) => void;

  readonly notifyScrollTopChanged!: (scrollTop: number) => void;

  protected readonly timeline!: YaTimeline;
}
