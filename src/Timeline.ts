import {
  TimeLineConfig,
  TimelineSettings,
  ViewConfigurationDefault,
} from "./types/configuration";
import { Axes } from "./components/Axes";
import { Ruler } from "./components/Ruler";
import { Grid } from "./components/Grid";
import { Events } from "./components/Events";
import { defaultViewConfig } from "./constants/options";
import { CanvasApi } from "./CanvasApi";
import { TimelineController } from "./TimelineController";
import { ComponentType, TimelineState } from "./enums";
import { Markers } from "./components/Markers";
import { ApiEvent, EventParams } from "./types/events";

/**
 * Main Timeline class that manages the timeline visualization and interactions
 * Handles component initialization, event management, and timeline state
 */
export class Timeline {
  public canvasScrollTop: number;
  public settings: TimelineSettings;
  public viewConfiguration: ViewConfigurationDefault;
  public api: CanvasApi;
  public eventEmitter = new EventTarget();
  public canvas: HTMLCanvasElement;
  public state = TimelineState.INIT;

  private controller: TimelineController;

  /**
   * Creates a new Timeline instance
   * @param config - Configuration object containing timeline settings and view configuration
   * @example
   * const timeline = new Timeline({
   *   settings: {
   *     start: Date.now(),
   *     end: Date.now() + 3600000,
   *     axes: [],
   *     events: []
   *   }
   * });
   */
  constructor(config: TimeLineConfig) {
    this.viewConfiguration = this.getViewConfig(config.viewConfiguration);
    this.settings = config.settings;
  }

  /**
   * Initializes the timeline with a canvas element
   * Sets up components, axes, events, and markers
   * @param canvas - HTML canvas element to render the timeline on
   * @throws {Error} If the provided canvas is invalid or not an HTMLCanvasElement
   * @example
   * const canvas = document.querySelector('canvas');
   * timeline.init(canvas);
   */
  public init(canvas: HTMLCanvasElement) {
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      throw new Error("Invalid canvas element provided to Timeline.init()");
    }

    if (this.state !== TimelineState.INIT) return;

    this.canvas = canvas;
    this.canvasScrollTop = 0;

    this.api = new CanvasApi(this);
    this.initComponents();

    this.api.setAxes(this.settings.axes);
    this.api.setEvents(this.settings.events);
    this.api.setMarkers(this.settings.markers || []);

    this.controller = new TimelineController(this.api);
    this.state = TimelineState.READY;
  }

  /**
   * Destroys the timeline instance, cleaning up all resources and event listeners
   * This method should be called when the timeline is no longer needed
   * @example
   * // Clean up when component unmounts
   * timeline.destroy();
   */
  public destroy() {
    this.controller.destroy();
    if (this.api) {
      this.api.destroy();
    }
  }

  /**
   * Adds an event listener to the timeline
   * @template EventName - The type of event to listen for, must be a key of ApiEvent
   * @template Cb - The callback function type, must match the event type in ApiEvent
   * @param type - The event type to listen for
   * @param listener - The callback function that will be called when the event occurs
   * @param options - Optional event listener options (same as addEventListener options)
   * @example
   * timeline.on('eventClick', (detail) => {
   *   console.log('Event clicked:', detail);
   * });
   */
  public on<
    EventName extends keyof ApiEvent = keyof ApiEvent,
    Cb extends ApiEvent[EventName] = ApiEvent[EventName],
  >(
    type: EventName,
    listener: Cb,
    options?: boolean | AddEventListenerOptions,
  ): void {
    this.eventEmitter.addEventListener(type, listener, options);
  }

  /**
   * Removes an event listener from the timeline
   * @template EventName - The type of event to remove listener from, must be a key of ApiEvent
   * @template Cb - The callback function type, must match the event type in ApiEvent
   * @param type - The event type to remove the listener from
   * @param listener - The callback function to remove
   * @param options - Optional event listener options (same as removeEventListener options)
   * @example
   * const handler = (detail) => console.log(detail);
   * timeline.on('eventClick', handler);
   * // Later...
   * timeline.off('eventClick', handler);
   */
  public off<
    EventName extends keyof ApiEvent = keyof ApiEvent,
    Cb extends ApiEvent[EventName] = ApiEvent[EventName],
  >(
    type: EventName,
    listener: Cb,
    options?: boolean | EventListenerOptions,
  ): void {
    this.eventEmitter.removeEventListener(type, listener, options);
  }

  /**
   * Emits an event to all registered listeners
   * @template EventName - The type of event to emit, must be a key of ApiEvent
   * @template Cb - The callback function type, must match the event type in ApiEvent
   * @template P - The type of the event detail parameter
   * @param type - The event type to emit
   * @param detail - Optional data to pass with the event
   * @returns The created CustomEvent instance
   * @example
   * timeline.emit('eventClick', { eventId: '123', time: Date.now() });
   */
  public emit<
    EventName extends keyof ApiEvent = keyof ApiEvent,
    Cb extends ApiEvent[EventName] = ApiEvent[EventName],
    P extends Parameters<Cb>[0] = Parameters<Cb>[0],
  >(type: EventName, detail?: EventParams<P>) {
    const event = new CustomEvent(type, {
      detail,
      bubbles: false,
      cancelable: true,
    });
    this.eventEmitter.dispatchEvent(event);
    return event;
  }

  /**
   * Merges default view configuration with provided configuration
   * @param config - Optional view configuration to merge with defaults
   * @returns Merged view configuration
   * @private
   */
  private getViewConfig(
    config?: TimeLineConfig["viewConfiguration"],
  ): ViewConfigurationDefault {
    return config
      ? ({ ...defaultViewConfig, ...config } as ViewConfigurationDefault)
      : defaultViewConfig;
  }

  /**
   * Initializes all timeline components
   * Creates and adds Grid, Axes, Events, Ruler (if not hidden), and Markers components
   * @private
   */
  private initComponents() {
    this.api.addComponent(ComponentType.Grid, new Grid(this.api));
    this.api.addComponent(ComponentType.Axes, new Axes(this.api));
    this.api.addComponent(ComponentType.Events, new Events(this.api));
    if (!this.viewConfiguration.hideRuler) {
      this.api.addComponent(ComponentType.Ruler, new Ruler(this.api));
    }
    this.api.addComponent(ComponentType.Markers, new Markers(this.api));
  }
}
