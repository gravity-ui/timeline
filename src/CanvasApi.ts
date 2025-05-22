import { alignNumber, convertDomain } from "./helpers/math";
import { SECOND } from "./constants/timeConstants";
import { Timeline } from "./Timeline";
import { BaseComponentInterface } from "./types/component";
import { ComponentType } from "./enums";
import { Events } from "./newComponents/Events";
import { Axes } from "./newComponents/Axes";
import { TimelineAxis } from "./types/axis";
import { TimelineEvent } from "./types/events";
import { Markers } from "./newComponents/Markers";
import { TimelineMarker } from "./types/markers";

export class CanvasApi {
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;

  protected components: Map<string, BaseComponentInterface>;
  protected timeline: Timeline;

  constructor(timeline: Timeline) {
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
      component.render();
    });
    this.ctx.restore();
  }

  public getVisualConfiguration() {
    return this.timeline.viewConfiguration;
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

  public setEvents<Event extends TimelineEvent>(newEvents: Event[]) {
    const events = this.getComponent<Events>(ComponentType.Events);
    events.setEvents(newEvents);
  }

  public setSelectedEvents(ids: string[]) {
    const events = this.getComponent<Events>(ComponentType.Events);
    events.setSelectedEvents(ids);
  }

  public setMarkers(newMarkers: TimelineMarker[]) {
    const markers = this.getComponent<Markers>(ComponentType.Markers);
    markers.setMarkers(newMarkers);
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

  public get width(): number {
    return this.canvas.width / this.pixelRatio;
  }

  public get height(): number {
    return this.canvas.height / this.pixelRatio;
  }

  public get currentTime(): number {
    return alignNumber(Date.now(), SECOND);
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
      component?.destroy();
      this.removeComponent(key);
    });
  }
}
