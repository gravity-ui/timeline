import RBush, { BBox } from "rbush";
import { Axes } from "../Axes";
import { rangeToRangeIntersect } from "../../helpers/math";
import { checkControlCommandKey } from "../../lib/utils";
import { DefaultEventRenderer } from "./DefaultEventRenderer";
import { CanvasApi } from "../../CanvasApi";
import { ComponentType } from "../../enums";
import { BaseComponentInterface } from "../../types/component";
import { TimelineEvent } from "../../types/events";

const MAX_INDEX_TREE_WIDTH = 16;

/**
 * Events component responsible for managing and rendering timeline events
 * Implements BaseComponentInterface for consistent component structure
 * @template Event - Type of event extending TimelineEvent
 */
export class Events<Event extends TimelineEvent = TimelineEvent>
  implements BaseComponentInterface
{
  public allowMultipleSelection = true;
  public activeEvent: TimelineEvent | null = null;
  protected index = new RBush<BBox & { event: Event }>(MAX_INDEX_TREE_WIDTH);

  private api: CanvasApi;
  private _selectedEvents = new Set<string>();
  private _events: Event[] = [];

  constructor(api: CanvasApi) {
    this.api = api;

    this.addEventListeners();
  }

  /**
   * Updates the events data and rebuilds the spatial index
   * @param newEvents - Array of events to display on the timeline
   */
  public setEvents(newEvents: Event[]) {
    this._events = newEvents;
    this.rebuildIndex();
    this.render();
  }

  /**
   * Finds events that intersect with the given rectangle
   * @param rect - DOMRect representing the search area
   * @returns Array of events that intersect with the rectangle
   */
  public getEventsAt(rect: DOMRect): Event[] {
    const vConfig = this.api.getVisualConfiguration();
    const rulerHeight = vConfig.ruler.height || 0;
    const topOffset = -rulerHeight + this.api.canvasScrollTop;
    const events = this.index.search({
      minX: this.api.positionToTime(rect.left - vConfig.events.hitboxPadding),
      maxX: this.api.positionToTime(rect.right + vConfig.events.hitboxPadding),
      minY: rect.top + topOffset - vConfig.events.hitboxPadding,
      maxY: rect.bottom + topOffset + vConfig.events.hitboxPadding,
    });
    return events.map((box) => box.event);
  }

  /**
   * Finds events at a specific point on the canvas
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns Array of events at the specified point
   */
  public getEventsAtPoint(x: number, y: number) {
    const p = 6;
    return this.getEventsAt(new DOMRect(x - p / 2, y - p / 2, p, p));
  }

  /**
   * Updates the set of selected event IDs
   * @param ids - Array of event IDs to mark as selected
   */
  public setSelectedEvents(ids: string[]) {
    this._selectedEvents = new Set<string>(ids);
    this.render();
  }

  /**
   * Gets all currently selected events
   * @returns Array of selected events
   */
  public getSelectedEvents(): Event[] {
    return this._events.filter((event) => this.isSelectedEvent(event));
  }

  /**
   * Checks if an event is currently selected
   * @param event - Event to check
   * @returns True if the event is selected, false otherwise
   */
  public isSelectedEvent(event: Event | undefined): boolean {
    if (!event) return false;
    return this._selectedEvents.has(event.id);
  }

  /**
   * Selects or deselects events based on provided options
   * @param events - Array of events to select/deselect
   * @param options - Selection options (append, toggle)
   */
  public selectEvents(events: Event[], options: SelectOptions = {}): void {
    const selection = this._selectedEvents;

    if (!options.append) {
      selection.clear();
    }

    const add = (id: string) => selection.add(id);
    const toggle = (id: string) => {
      if (selection.has(id)) {
        selection.delete(id);
      } else {
        selection.add(id);
      }
    };

    const select = options.toggle ? toggle : add;

    if (this.allowMultipleSelection) {
      for (const event of events) {
        select(event.id);
      }
    } else if (events.length > 0) {
      if (selection.size > 0 && !selection.has(events[0].id)) {
        selection.clear();
      }

      select(events[0].id);
    }

    this.api.emit("on-select-change", { events: this.getSelectedEvents() });
    this.api.rerender();
  }

  public render() {
    const { ruler, events } = this.api.getVisualConfiguration();
    const { start, end } = this.api.getInterval();
    const axesComponent = this.api.getComponent<Axes>(ComponentType.Axes);
    const rulerHeight = ruler.height || 0;

    if (!axesComponent) {
      return;
    }

    this.api.useScrollTransform();

    const ctx = this.api.ctx;
    const timeToPosition = (t: number) => this.api.timeToPosition(t);

    ctx.translate(0, rulerHeight);

    ctx.font = events.font;
    ctx.lineWidth = 2;

    for (let i = 0, len = this._events.length; i < len; i += 1) {
      const event: Event = this._events[i];
      const axis = axesComponent.getAxesById()[event.axisId];

      if (!axis) continue;

      const y = axesComponent.getAxisTrackPosition(axis, event.trackIndex);
      const eventTo = event.to || end;

      if (axis && rangeToRangeIntersect(start, end, event.from, eventTo)) {
        const x0 = this.api.timeToPosition(event.from);
        const x1 = this.api.timeToPosition(eventTo);
        this.runRenderer(
          ctx,
          event,
          this.isSelectedEvent(event),
          x0,
          x1,
          y,
          axis.height,
          timeToPosition,
        );
      }
    }
  }

  /**
   * Cleans up event listeners when component is destroyed
   */
  public destroy() {
    this.api.canvas.removeEventListener("mouseup", this.handleCanvasMouseup);
    this.api.canvas.removeEventListener(
      "contextmenu",
      this.handleCanvasContextMenu,
    );
    this.api.canvas.removeEventListener(
      "mousemove",
      this.handleCanvasMousemove,
    );
  }

  /**
   * Adds necessary event listeners for mouse interactions
   */
  protected addEventListeners() {
    this.api.canvas.addEventListener("mouseup", this.handleCanvasMouseup);
    this.api.canvas.addEventListener(
      "contextmenu",
      this.handleCanvasContextMenu,
    );
    this.api.canvas.addEventListener("mousemove", this.handleCanvasMousemove);
  }

  /**
   * Renders an event using its renderer or the default renderer
   * @param ctx - Canvas rendering context
   * @param event - Event to render
   * @param isSelected - Whether the event is selected
   * @param x0 - Start X coordinate
   * @param x1 - End X coordinate
   * @param y - Y coordinate
   * @param h - Height of the event
   * @param timeToPosition - Optional function to convert time to position
   * @param color - Optional color override
   */
  protected runRenderer(
    ctx: CanvasRenderingContext2D,
    event: Event,
    isSelected: boolean,
    x0: number,
    x1: number,
    y: number,
    h: number,
    timeToPosition?: (n: number) => number,
    color?: string,
  ) {
    if (!event.renderer) {
      event.renderer = new DefaultEventRenderer();
    }

    event.renderer.render(
      ctx,
      event,
      isSelected,
      x0,
      x1,
      y,
      h,
      timeToPosition,
      color,
    );
  }

  protected handleCanvasMouseup = (event: MouseEvent) => {
    const candidates = this.getEventsAtPoint(event.offsetX, event.offsetY);
    this.api.emit("on-click", {
      events: candidates,
      time: this.api.positionToTime(event.offsetX),
      relativeX: event.clientX,
      relativeY: event.clientY,
    });

    if (candidates.length > 0) {
      this.selectEvents(candidates, {
        append: checkControlCommandKey(event),
        toggle: true,
      });
    } else {
      this.selectEvents([]);
    }
  };

  protected handleCanvasContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    const candidates = this.getEventsAtPoint(event.offsetX, event.offsetY);
    const candidate = candidates.length > 0 ? candidates[0] : undefined;

    this.api.emit("on-context-click", {
      event: candidate,
      time: this.api.positionToTime(event.offsetX),
      relativeX: event.clientX,
      relativeY: event.clientY,
    });
  };

  protected handleCanvasMousemove = (event: MouseEvent) => {
    event.preventDefault();
    const candidates = this.getEventsAtPoint(event.offsetX, event.offsetY);
    const candidate = candidates.length > 0 ? candidates[0] : undefined;

    if (this.activeEvent && (this.activeEvent !== candidate || !candidate)) {
      this.api.emit("on-leave", { event: this.activeEvent });
    }

    if (!candidate) {
      this.activeEvent = null;
      return;
    }

    const api = this.api;
    this.activeEvent = candidate;

    this.api.emit("on-hover", {
      event: candidate,
      time: api.positionToTime(event.offsetX),
      relativeX: event.clientX,
      relativeY: event.clientY,
    });
  };

  /**
   * Rebuilds the spatial index for efficient event lookup
   * Updates the RBush tree with current event positions
   */
  protected rebuildIndex(): void {
    const { end } = this.api.getInterval();
    const { axes } = this.api.getVisualConfiguration();

    const axesComponent = this.api.getComponent<Axes>(ComponentType.Axes);
    const axesById = axesComponent.getAxesById();

    const boxes = this._events.map((event): BBox & { event: Event } => {
      const axis = axesById[event.axisId];
      const eventTrackY = axesComponent.getAxisTrackPosition(
        axis,
        event.trackIndex,
      );

      const minX = event.from;
      const maxX = event.to ? event.to : end;
      const minY = eventTrackY - axes.lineHeight / 2;
      const maxY = eventTrackY + axes.lineHeight / 2;
      return { minX, maxX, minY, maxY, event };
    });
    this.index.clear();
    this.index.load(boxes);
  }
}

export type SelectOptions = {
  append?: boolean;
  toggle?: boolean;
  contextmenu?: boolean;
};
