import { clamp } from "./helpers/math";
import { MONTH, SECOND } from "./definitions";
import { CanvasApi } from "./CanvasApi";

const WHEEL_PAN_SPEED = 0.00025;
const ZOOM_MIN = SECOND * 5;
const ZOOM_MAX = MONTH * 2;

export class TimelineController {
  api: CanvasApi;

  constructor(api: CanvasApi) {
    this.api = api;

    this.updateCanvasSize();
    this.init();
  }

  public init() {
    window.addEventListener("resize", this.updateCanvasSize);
    this.api.canvas.addEventListener("wheel", this.handleCanvasWheel);
  }

  public destroy() {
    window.removeEventListener("resize", this.updateCanvasSize);
    this.api.canvas.removeEventListener("wheel", this.handleCanvasWheel);
  }

  private updateCanvasSize() {
    const pixelRatio = window.devicePixelRatio || 1;
    this.api.canvas.width = Math.floor(
      this.api.canvas.offsetWidth * pixelRatio,
    );
    this.api.canvas.height = Math.floor(
      this.api.canvas.offsetHeight * pixelRatio,
    );

    this.api.rerender();
  }

  private handleCanvasWheel = (event: WheelEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const { start, end } = this.api.getInterval();

    let newStart = start;
    let newEnd = end;
    let isPanned = false;
    const oldDomain = newEnd - newStart;

    if (Math.abs(event.deltaY) > 2) {
      if (event.shiftKey) {
        isPanned = true;
        const shift = oldDomain * event.deltaY * WHEEL_PAN_SPEED;
        newStart += shift;
        newEnd += shift;
      } else {
        const ratio = event.offsetX / this.api.canvas.width;
        const factor = event.deltaY > 0 ? 1.15 : 0.9;
        const newDomain = clamp(oldDomain * factor, ZOOM_MIN, ZOOM_MAX);
        newStart = Math.round(start - (newDomain - oldDomain) * ratio);
        newEnd = Math.round(end + (newDomain - oldDomain) * (1 - ratio));
      }
    }

    if (!isPanned && event.deltaX !== 0) {
      const newDomain = newEnd - newStart;
      const shift = newDomain * event.deltaX * WHEEL_PAN_SPEED;
      newStart += shift;
      newEnd += shift;
    }

    if (newStart !== start || newEnd !== end) {
      this.api.setRange(newStart, newEnd);
    }
  };
}
