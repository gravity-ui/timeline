import { clamp } from "./helpers/math";
import { MONTH, SECOND } from "./constants/timeConstants";
import { CanvasApi } from "./CanvasApi";
import debounce_ from "lodash/debounce";
import { TimelineEvent, TimelineMarker, TimelineSection } from "./types";
import { ComponentType, ZoomMode } from "./enums";
import { Events } from "./components/Events";
import { Markers } from "./components/Markers";
import { Sections } from "./components/Sections";

const WHEEL_PAN_SPEED = 0.00025;
const ZOOM_MIN = SECOND * 5;
const ZOOM_MAX = MONTH * 2;

/**
 * Controller class responsible for handling timeline interactions and canvas resizing
 * Manages zoom, pan, and canvas size updates
 */
export class TimelineController<
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
> {
  api: CanvasApi<TEvent, TMarker, TSection>;
  private resizeObserver?: ResizeObserver;

  private emitCameraChange = debounce_((newStart: number, newEnd: number) => {
    this.api.emit("on-camera-change", { from: newStart, to: newEnd });
  }, 150);

  /**
   * Creates a new TimelineController instance
   * @param api - CanvasApi instance for timeline manipulation
   */
  constructor(api: CanvasApi<TEvent, TMarker, TSection>) {
    this.api = api;

    this.updateCanvasSize();
    this.init();
  }

  /**
   * Initializes event listeners for canvas resize and wheel events
   */
  public init() {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateCanvasSize();
    });
    this.resizeObserver.observe(this.api.canvas);
    this.api.canvas.addEventListener("wheel", this.handleCanvasWheel);
    this.api.canvas.addEventListener("mouseup", this.handleCanvasMouseup);
  }

  /**
   * Cleans up event listeners when the controller is destroyed
   */
  public destroy() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.api.canvas.removeEventListener("wheel", this.handleCanvasWheel);
    this.api.canvas.removeEventListener("mouseup", this.handleCanvasMouseup);
  }

  /**
   * Updates canvas size based on container dimensions and device pixel ratio
   * Triggers re-render after size update
   * @private
   */
  private updateCanvasSize = () => {
    const pixelRatio = window.devicePixelRatio || 1;
    const logicalWidth = this.api.canvas.offsetWidth;
    const logicalHeight = this.api.canvas.offsetHeight;

    // Set internal canvas size (physical pixels)
    this.api.canvas.width = Math.floor(logicalWidth * pixelRatio);
    this.api.canvas.height = Math.floor(logicalHeight * pixelRatio);

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
    const { camera } = this.api.getViewConfiguration();
    const zoomMode = camera.zoom;

    if (zoomMode === ZoomMode.NONE) return;

    let newStart = start;
    let newEnd = end;
    let isPanned = false;
    const oldDomain = newEnd - newStart;

    if (Math.abs(event.deltaY) > 2) {
      if (event.shiftKey || zoomMode === ZoomMode.HORIZONTAL) {
        isPanned = true;
        const shift = oldDomain * event.deltaY * WHEEL_PAN_SPEED;
        newStart += shift;
        newEnd += shift;
      } else {
        const factor = event.deltaY > 0 ? 1.15 : 0.9;
        const newDomain = clamp(oldDomain * factor, ZOOM_MIN, ZOOM_MAX);

        // Check if the cursor is inside the canvas (using logical pixels)
        if (
          event.offsetX >= 0 &&
          event.offsetX <= this.api.canvas.offsetWidth &&
          event.offsetY >= 0 &&
          event.offsetY <= this.api.canvas.offsetHeight
        ) {
          // Center zoom around the cursor position
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
      this.emitCameraChange(newStart, newEnd);
    }
  };

  /**
   * Handles mouse up events on the canvas
   * Returns both events and markers at the click point
   * @param event - MouseEvent from canvas
   * @private
   */
  private handleCanvasMouseup = (event: MouseEvent): void => {
    const { clickEventsCollectionFilter, clickMarkerCollectionFilter } =
      this.api.getTimelineSettings();

    const eventsComponent = this.api.getComponent<
      Events<TEvent, TMarker, TSection>
    >(ComponentType.Events);
    const markersComponent = this.api.getComponent<
      Markers<TEvent, TMarker, TSection>
    >(ComponentType.Markers);
    const sectionsComponent = this.api.getComponent<
      Sections<TEvent, TMarker, TSection>
    >(ComponentType.Sections);

    const events = eventsComponent
      ? eventsComponent.getEventsAtPoint(event.offsetX, event.offsetY)
      : [];
    const markers = markersComponent
      ? markersComponent.getMarkersAtPoint(event.offsetX, event.offsetY)
      : [];
    const sections = sectionsComponent.getSectionsAtPoint(
      event.offsetX,
      event.offsetY,
    );

    this.api.emit("on-click", {
      events: clickEventsCollectionFilter
        ? clickEventsCollectionFilter(events)
        : events,
      markers: clickMarkerCollectionFilter
        ? clickMarkerCollectionFilter(markers)
        : markers,
      sections,
    });
  };
}
