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
  private activeElements: {
    events: TEvent[];
    markers: TMarker[];
    sections: TSection[];
  } | null = null;

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
    this.api.canvas.addEventListener("mousemove", this.handleCanvasMouseMove);
  }

  /**
   * Cleans up event listeners when the controller is destroyed
   */
  public destroy() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.api.canvas.removeEventListener("wheel", this.handleCanvasWheel);
    this.api.canvas.removeEventListener("mouseup", this.handleCanvasMouseup);
    this.api.canvas.removeEventListener(
      "mousemove",
      this.handleCanvasMouseMove,
    );
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

  /**
   * Handles mouse move events on the canvas
   * Emits hover and leave events for events, markers, and sections
   * @param event - MouseEvent from canvas
   * @private
   */
  private handleCanvasMouseMove = (event: MouseEvent): void => {
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
    const sections = sectionsComponent
      ? sectionsComponent.getSectionsAtPoint(event.offsetX, event.offsetY)
      : [];

    const currentElements = { events, markers, sections };

    const isEqual =
      JSON.stringify(this.activeElements) === JSON.stringify(currentElements);

    if (isEqual) return;

    if (
      this.activeElements &&
      (this.activeElements.events.length > 0 ||
        this.activeElements.markers.length > 0 ||
        this.activeElements.sections.length > 0)
    ) {
      const currentEventIds = new Set(events.map(({ id }) => id));
      const currentMarkerTimes = new Set(markers.map(({ time }) => time));
      const currentSectionIds = new Set(sections.map(({ id }) => id));

      const leftEvents = this.activeElements.events.filter(
        ({ id }) => !currentEventIds.has(id),
      );
      const leftMarkers = this.activeElements.markers.filter(
        ({ time }) => !currentMarkerTimes.has(time),
      );
      const leftSections = this.activeElements.sections.filter(
        ({ id }) => !currentSectionIds.has(id),
      );

      if (
        leftEvents.length > 0 ||
        leftMarkers.length > 0 ||
        leftSections.length > 0
      ) {
        this.api.emit("on-leave", {
          events: leftEvents,
          markers: leftMarkers,
          sections: leftSections,
        });
      }
    }

    this.activeElements = currentElements;
    if (events.length > 0 || markers.length > 0 || sections.length > 0) {
      this.api.emit("on-hover", {
        events,
        markers,
        sections,
        time: this.api.positionToTime(event.offsetX),
        relativeX: event.clientX,
        relativeY: event.clientY,
      });
    }
  };
}
