import { clamp } from "./helpers/math";
import { MONTH, SECOND } from "./constants/timeConstants";
import { CanvasApi } from "./CanvasApi";

const WHEEL_PAN_SPEED = 0.00025;
const ZOOM_MIN = SECOND * 5;
const ZOOM_MAX = MONTH * 2;

/**
 * Controller class responsible for handling timeline interactions and canvas resizing
 * Manages zoom, pan, and canvas size updates
 */
export class TimelineController {
  api: CanvasApi;

  /**
   * Creates a new TimelineController instance
   * @param api - CanvasApi instance for timeline manipulation
   */
  constructor(api: CanvasApi) {
    this.api = api;

    this.updateCanvasSize();
    this.init();
  }

  /**
   * Initializes event listeners for window resize and canvas wheel events
   */
  public init() {
    window.addEventListener("resize", this.updateCanvasSize);
    this.api.canvas.addEventListener("wheel", this.handleCanvasWheel);
  }

  /**
   * Cleans up event listeners when controller is destroyed
   */
  public destroy() {
    window.removeEventListener("resize", this.updateCanvasSize);
    this.api.canvas.removeEventListener("wheel", this.handleCanvasWheel);
  }

  /**
   * Updates canvas size based on container dimensions and device pixel ratio
   * Triggers re-render after size update
   * @private
   */
  private updateCanvasSize = () => {
    const pixelRatio = window.devicePixelRatio || 1;
    this.api.canvas.width = Math.floor(
      this.api.canvas.offsetWidth * pixelRatio,
    );
    this.api.canvas.height = Math.floor(
      this.api.canvas.offsetHeight * pixelRatio,
    );

    this.api.rerender();
  };

  /**
   * Handles mouse wheel events for zooming and panning
   * Supports:
   * - Zoom with mouse wheel (centered on cursor position)
   * - Pan with shift + wheel
   * - Horizontal pan with wheel deltaX
   * @param event - WheelEvent from canvas
   * @private
   */
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
        const factor = event.deltaY > 0 ? 1.15 : 0.9;
        const newDomain = clamp(oldDomain * factor, ZOOM_MIN, ZOOM_MAX);

        // Check if cursor is inside the canvas
        if (
          event.offsetX >= 0 &&
          event.offsetX <= this.api.canvas.width &&
          event.offsetY >= 0 &&
          event.offsetY <= this.api.canvas.height
        ) {
          // Center zoom around cursor position
          const cursorTime = this.api.positionToTime(event.offsetX);
          const ratio = (cursorTime - start) / oldDomain;
          newStart = Math.round(cursorTime - ratio * newDomain);
          newEnd = Math.round(cursorTime + (1 - ratio) * newDomain);
        }
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
