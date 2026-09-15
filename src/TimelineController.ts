import { CanvasApi } from "./CanvasApi";
import { SECOND } from "./constants/timeConstants";
import debounce_ from "lodash/debounce";
import {
  CameraInteractionAction,
  CameraInteractions,
  CameraViewOptionsDefault,
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
} from "./types";
import { ComponentType, ZoomMode } from "./enums";
import { Events } from "./components/Events";
import { Markers } from "./components/Markers";
import { Sections } from "./components/Sections";

const WHEEL_PAN_SPEED = 0.00025;
const DEFAULT_MIN_RANGE = SECOND * 5;
const MAX_TIMESTAMP = 8_640_000_000_000_000;
const WHEEL_DELTA_THRESHOLD = 2;
const WHEEL_LISTENER_OPTIONS: AddEventListenerOptions = { passive: false };
const WHEEL_LISTENER_REMOVAL_OPTIONS: EventListenerOptions = {
  capture: false,
};

type WheelInteraction = keyof CameraInteractions;

type WheelGesture = {
  interaction: WheelInteraction;
  delta: number;
  isNativeHorizontal: boolean;
};

const CAMERA_INTERACTION_PRESETS: Record<
  ZoomMode,
  Required<CameraInteractions>
> = {
  [ZoomMode.DEFAULT]: {
    verticalWheel: "zoom",
    horizontalWheel: "pan",
    pinch: "zoom",
  },
  [ZoomMode.HORIZONTAL]: {
    verticalWheel: "pan",
    horizontalWheel: "pan",
    pinch: "pan",
  },
  [ZoomMode.NONE]: {
    verticalWheel: "pass-through",
    horizontalWheel: "pass-through",
    pinch: "pass-through",
  },
};

const getWheelGesture = (event: WheelEvent): WheelGesture | undefined => {
  if (event.ctrlKey) {
    if (event.deltaY === 0) return undefined;

    return {
      interaction: "pinch",
      delta: event.deltaY,
      isNativeHorizontal: false,
    };
  }

  if (event.shiftKey && event.deltaY !== 0) {
    return {
      interaction: "horizontalWheel",
      delta: event.deltaY,
      isNativeHorizontal: false,
    };
  }

  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
    if (event.deltaX === 0) return undefined;

    return {
      interaction: "horizontalWheel",
      delta: event.deltaX,
      isNativeHorizontal: true,
    };
  }

  if (event.deltaY === 0) return undefined;

  return {
    interaction: "verticalWheel",
    delta: event.deltaY,
    isNativeHorizontal: false,
  };
};

const getCameraInteractions = ({
  zoom,
  interactions,
}: CameraViewOptionsDefault): Required<CameraInteractions> => ({
  ...CAMERA_INTERACTION_PRESETS[zoom],
  ...interactions,
});

const getZoomDomain = (
  domain: number,
  factor: number,
  minRange: number,
  maxRange?: number,
) => {
  const nextDomain = domain * factor;

  if (factor < 1) {
    return domain <= minRange ? domain : Math.max(nextDomain, minRange);
  }

  if (maxRange === undefined) return nextDomain;

  return domain >= maxRange ? domain : Math.min(nextDomain, maxRange);
};

const isPositiveFiniteNumber = (value: number | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const getZoomRangeLimits = (
  minRange: number | undefined,
  maxRange: number | undefined,
  cursorTime: number,
  ratio: number,
) => {
  const minimum = isPositiveFiniteNumber(minRange)
    ? minRange
    : DEFAULT_MIN_RANGE;
  const maximum = isPositiveFiniteNumber(maxRange) ? maxRange : undefined;

  if (!Number.isFinite(ratio) || ratio < 0 || ratio > 1) {
    return {
      minRange: maximum === undefined ? minimum : Math.min(minimum, maximum),
      maxRange: maximum,
    };
  }

  const maximumByStart =
    ratio === 0 ? Infinity : (cursorTime + MAX_TIMESTAMP) / ratio;
  const maximumByEnd =
    ratio === 1 ? Infinity : (MAX_TIMESTAMP - cursorTime) / (1 - ratio);
  const technicalMaximum = Math.min(maximumByStart, maximumByEnd);
  const effectiveMaximum = Math.min(maximum ?? Infinity, technicalMaximum);

  return {
    minRange: Math.min(minimum, effectiveMaximum),
    maxRange: effectiveMaximum,
  };
};

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
    this.api.canvas.addEventListener(
      "wheel",
      this.handleCanvasWheel,
      WHEEL_LISTENER_OPTIONS,
    );
    this.api.canvas.addEventListener("mouseup", this.handleCanvasMouseup);
    this.api.canvas.addEventListener("mousemove", this.handleCanvasMouseMove);
  }

  /**
   * Cleans up event listeners when the controller is destroyed
   */
  public destroy() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.api.canvas.removeEventListener(
      "wheel",
      this.handleCanvasWheel,
      WHEEL_LISTENER_REMOVAL_OPTIONS,
    );
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
   * Handles wheel events according to the configured camera interactions.
   * @param event - WheelEvent from canvas
   * @private
   */
  private handleCanvasWheel = (event: WheelEvent) => {
    const { camera } = this.api.getViewConfiguration();
    const gesture = getWheelGesture(event);

    if (!gesture) return;

    const action: CameraInteractionAction =
      getCameraInteractions(camera)[gesture.interaction];

    if (action === "pass-through") return;

    event.stopPropagation();
    event.preventDefault();

    const { start, end } = this.api.getInterval();
    let newStart = start;
    let newEnd = end;
    const oldDomain = newEnd - newStart;

    const hasEnoughDelta =
      gesture.isNativeHorizontal ||
      Math.abs(gesture.delta) > WHEEL_DELTA_THRESHOLD;

    if (action === "pan" && hasEnoughDelta) {
      const shift = oldDomain * gesture.delta * WHEEL_PAN_SPEED;
      newStart += shift;
      newEnd += shift;
    }

    if (action === "zoom" && hasEnoughDelta) {
      const factor = gesture.delta > 0 ? 1.15 : 0.9;

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
        const rangeLimits = getZoomRangeLimits(
          camera.minRange,
          camera.maxRange,
          cursorTime,
          ratio,
        );
        const newDomain = getZoomDomain(
          oldDomain,
          factor,
          rangeLimits.minRange,
          rangeLimits.maxRange,
        );
        newStart = Math.round(cursorTime - ratio * newDomain);
        newEnd = Math.round(cursorTime + (1 - ratio) * newDomain);
      }
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
