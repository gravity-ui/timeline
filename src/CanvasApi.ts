import { alignNumber, convertDomain } from "./helpers/math";
import { SECOND } from "./constants/timeConstants";
import { Timeline } from "./Timeline";
import { ComponentType } from "./enums";
import { Events } from "./components/Events";
import { Axes } from "./components/Axes";
import { Markers } from "./components/Markers";
import {
  BaseComponentInterface,
  TimelineAxis,
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
  ViewConfiguration,
  ViewConfigurationDefault,
} from "./types";
import { Sections } from "./components/Sections";
import { deepMerge } from "./lib/utils";

export class CanvasApi<
  TEvent extends TimelineEvent,
  TMarker extends TimelineMarker,
  TSection extends TimelineSection,
> {
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;

  protected components: Map<string, BaseComponentInterface>;
  protected timeline: Timeline<TEvent, TMarker, TSection>;

  constructor(timeline: Timeline<TEvent, TMarker, TSection>) {
    this.timeline = timeline;
    this.canvas = this.timeline.canvas;
    this.components = new Map<string, BaseComponentInterface>();
    this.ctx = this.canvas.getContext("2d");
    this.ctx.globalAlpha = 1.0;
  }

  public addComponent(key: string, component: BaseComponentInterface) {
    this.components.set(key, component);
  }

  public removeComponent(key: string) {
    this.components.delete(key);
  }

  public getComponent<T extends BaseComponentInterface>(
    key: string,
  ): T | undefined {
    if (this.components.has(key)) return this.components.get(key) as T;
    return undefined;
  }

  public rerender(clearBeforeRender = true) {
    if (clearBeforeRender) {
      this.clear();
    }

    if (!this.components.size) return;

    this.ctx.save();
    this.components.forEach((component) => {
      component.rebuildIndex?.();
      component.render();
    });
    this.ctx.restore();
  }

  public getViewConfiguration() {
    return this.timeline.viewConfiguration;
  }

  public getRulerHeight() {
    const config = this.timeline.viewConfiguration;
    if (config.hideRuler) return 0;
    return config.ruler.height || 0;
  }

  public getTimelineSettings() {
    return this.timeline.settings;
  }

  public setRange(start: number, end: number) {
    this.timeline.settings.start = start;
    this.timeline.settings.end = end;
    this.rerender();
  }

  public setAxes<Axis extends TimelineAxis>(newAxes: Axis[]) {
    const axes = this.getComponent<Axes>(ComponentType.Axes);
    axes.setAxes(newAxes);
  }

  public setEvents(newEvents: TEvent[], selectedIds?: string[]) {
    const events = this.getComponent<Events<TEvent, TMarker>>(
      ComponentType.Events,
    );
    events.setEvents(newEvents, selectedIds);
    this.rerender();
  }

  public setSections(newSections: TSection[]) {
    const sections = this.getComponent<Sections<TEvent, TMarker, TSection>>(
      ComponentType.Sections,
    );
    sections.setSections(newSections);
    this.rerender();
  }

  public setSelectedEvents(ids: string[]) {
    const events = this.getComponent<Events<TEvent, TMarker>>(
      ComponentType.Events,
    );
    events.setSelectedEvents(ids);
  }

  public setMarkers(newMarkers: TMarker[]) {
    const markers = this.getComponent<Markers<TEvent, TMarker>>(
      ComponentType.Markers,
    );
    markers.setMarkers(newMarkers);
  }

  public setCanvasScrollTop(newScrollTop: number) {
    this.timeline.canvasScrollTop = newScrollTop;
    this.rerender();
  }

  public setViewConfiguration(viewConfiguration: ViewConfiguration) {
    this.timeline.viewConfiguration = deepMerge(
      this.timeline.viewConfiguration,
      viewConfiguration,
    ) as ViewConfigurationDefault;
    this.rerender();
  }

  public get pixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  public get canvasScrollTop(): number {
    return this.timeline.canvasScrollTop || 0;
  }

  public getInterval(): { start: number; end: number } {
    const { start, end } = this.timeline.settings;

    return {
      start,
      end,
    };
  }

  public getSelectedEvents(): TEvent[] {
    const events = this.getComponent<Events<TEvent, TMarker>>(
      ComponentType.Events,
    );
    return events.getSelectedEvents();
  }

  public get width(): number {
    return this.canvas.width / this.pixelRatio;
  }

  public get height(): number {
    return this.canvas.height / this.pixelRatio;
  }

  public get currentTime(): number {
    return alignNumber(Date.now(), SECOND);
  }

  public get emit() {
    return this.timeline.emit.bind(this.timeline);
  }

  public widthToTime(px: number): number {
    return this.positionToTime(px) - this.getInterval().start;
  }

  public timeToPosition(t: number): number {
    const actualWidth = this.width;
    return (
      convertDomain(
        t,
        this.timeline.settings.start,
        this.timeline.settings.end,
        0,
        actualWidth,
      ) || 0
    );
  }

  public positionToTime(px: number): number {
    return convertDomain(
      px,
      0,
      this.width,
      this.timeline.settings.start,
      this.timeline.settings.end,
    );
  }

  public clear(): void {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public useStaticTransform(): void {
    const dpr = this.pixelRatio;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  public useScrollTransform(): void {
    const dpr = this.pixelRatio;
    const yOffset = this.canvasScrollTop * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, -yOffset);
  }

  public destroy(): void {
    this.components.forEach((component, key) => {
      component?.destroy?.();
      this.removeComponent(key);
    });
  }

  public getCameraPosition() {
    return {
      y0: this.canvasScrollTop,
      y1: this.canvasScrollTop + this.height,
      x0: 0,
      x1: this.width,
    };
  }

  public getEventPosition(event: TEvent) {
    if (!event) {
      throw new Error("Invalid event");
    }

    const axesComponent = this.getComponent<Axes>(ComponentType.Axes);
    if (!axesComponent) {
      throw new Error("Invalid axes configuration");
    }

    const axis = axesComponent.getAxesById()[event.axisId];
    if (!axis) {
      throw new Error("Invalid axis id");
    }

    const { end } = this.getInterval();
    const x0 = this.timeToPosition(event.from);
    const x1 = this.timeToPosition(event.to || end);
    const y0 =
      axesComponent.getAxisTrackPosition(axis, event.trackIndex) +
      this.getRulerHeight() -
      this.canvasScrollTop;

    return {
      x0,
      x1,
      y0,
      h: axis.height,
    };
  }

  public getSectionPosition(section: TSection) {
    if (!section) {
      throw new Error("Invalid section");
    }

    const { end } = this.getInterval();
    const x0 = this.timeToPosition(section.from);
    const x1 = this.timeToPosition(section.to || end);
    const rulerHeight = this.getRulerHeight();
    const y0 = rulerHeight - this.canvasScrollTop;

    return {
      x0,
      x1,
      y0: y0 > 0 ? y0 : 0,
      h: this.height - rulerHeight,
    };
  }
}
