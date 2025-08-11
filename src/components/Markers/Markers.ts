import { pointToRangeIntersect } from "../../helpers/math";
import { BaseComponentInterface } from "../../types/component";
import { LabelSize, TimelineMarker } from "../../types/markers";
import { CanvasApi } from "../../CanvasApi";
import { TimelineEvent } from "../../types";
import { DefaultMarkerRenderer } from "./DefaultMarkerRenderer";
import RBush, { BBox } from "rbush";

const MAX_INDEX_TREE_WIDTH = 16;

/**
 * Handles rendering timeline markers on the canvas
 * Implements BaseComponentInterface for a consistent component structure
 */
export class Markers<
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
> implements BaseComponentInterface
{
  protected api: CanvasApi<TEvent, TMarker>;
  protected _sortedMarkers: TMarker[] = [];
  protected index = new RBush<BBox & { marker: TMarker }>(MAX_INDEX_TREE_WIDTH);
  // Tracks last rendered label positions to prevent overlapping
  protected lastRenderedLabelPosition = { top: Infinity, bottom: Infinity };
  private textWidthCache = new Map<string, LabelSize>();
  private _selectedMarkers = new Set<number>();
  private hoveredMarker: number = undefined;

  constructor(api: CanvasApi<TEvent, TMarker>) {
    this.api = api;
    this.addEventListeners();
  }

  /**
   * Updates markers data and triggers re-render
   * @param markers - Array of timeline markers to display
   */
  public setMarkers(markers: TMarker[]) {
    // Sort markers by time for efficient rendering
    this._sortedMarkers = markers.slice().sort((a, b) => a.time - b.time);
    this.rebuildIndex();
    this.render();
  }

  public getMarkersAt(rect: DOMRect): TMarker[] {
    const {
      markers: { hitboxPadding },
    } = this.api.getViewConfiguration();

    const markers = this.index.search({
      minX: this.api.positionToTime(rect.left - hitboxPadding),
      maxX: this.api.positionToTime(rect.right + hitboxPadding),
      minY: 0,
      maxY: this.api.ctx.canvas.height,
    });
    return markers
      .filter((box) => !box.marker.nonSelectable)
      .map((box) => box.marker);
  }

  public getMarkersAtPoint(x: number, y: number) {
    const p = 6;
    return this.getMarkersAt(new DOMRect(x - p / 2, y - p / 2, p, p));
  }

  public isSelectedMarker(time: number) {
    return this._selectedMarkers.has(time);
  }

  public isHoveredMarker(time: number) {
    return this.hoveredMarker === time;
  }

  /**
   * Renders all visible markers within the current viewport
   */
  public render() {
    this.api.useStaticTransform();
    // Reset label positions for a new render pass
    this.lastRenderedLabelPosition = { top: Infinity, bottom: Infinity };

    const { start, end } = this.api.getInterval();

    const visibleMarkers: TMarker[] = [];
    for (let i = 0; i < this._sortedMarkers.length; i += 1) {
      const marker = this._sortedMarkers[i];
      const overscan = marker.label
        ? this.api.widthToTime(this.getLabelSize(marker.label).width)
        : 0;
      if (
        pointToRangeIntersect(marker.time, start - overscan, end + overscan)
      ) {
        visibleMarkers.push(marker);
      }
    }

    const collapsedMarkers = this.collapseCloseSimilarMarkers(visibleMarkers);

    for (let i = collapsedMarkers.length - 1; i >= 0; i -= 1) {
      const marker = collapsedMarkers[i];
      const renderer = marker.renderer || new DefaultMarkerRenderer<TMarker>();
      renderer.render({
        ctx: this.api.ctx,
        marker,
        isSelected: this.isSelectedMarker(marker.time),
        isHovered: this.isHoveredMarker(marker.time),
        markerPosition: this.api.timeToPosition(marker.time),
        viewConfiguration: this.api.getViewConfiguration(),
        lastRenderedLabelPosition: this.lastRenderedLabelPosition,
        timeToPosition: this.api.timeToPosition,
        getLabelSize: this.getLabelSize.bind(this),
      });
    }
  }

  public destroy() {
    this.api.canvas.removeEventListener("mouseup", this.handleCanvasMouseup);
    this.api.canvas.removeEventListener(
      "mousemove",
      this.handleCanvasMousemove,
    );
  }

  protected getLabelSize(text: string): LabelSize {
    if (this.textWidthCache.has(text)) {
      return this.textWidthCache.get(text);
    }

    const measureResult = this.api.ctx.measureText(text);
    const result: LabelSize = {
      width: measureResult.width,
      height:
        measureResult.actualBoundingBoxAscent +
        measureResult.actualBoundingBoxDescent,
    };

    this.textWidthCache.set(text, result);
    return result;
  }

  protected handleCanvasMouseup = (event: MouseEvent) => {
    const candidates = this.getMarkersAtPoint(event.offsetX, event.offsetY);

    const times = candidates.map((marker) => marker.time);
    const arraysAreEqual =
      times.length === this._selectedMarkers.size &&
      times.every((num) => this._selectedMarkers.has(num));

    if (arraysAreEqual) return;

    if (candidates.length) {
      this._selectedMarkers = new Set(times);
    } else {
      this._selectedMarkers.clear();
    }

    this.api.emit("on-marker-select-change", {
      markers: candidates,
      time: this.api.positionToTime(event.offsetX),
      relativeX: event.clientX,
      relativeY: event.clientY,
    });
    this.api.rerender();
  };

  protected handleCanvasMousemove = (event: MouseEvent) => {
    const candidates = this.getMarkersAtPoint(event.offsetX, event.offsetY);

    const newHover = candidates.length ? candidates[0].time : undefined;
    if (this.hoveredMarker === newHover) return;

    this.hoveredMarker = newHover;
    this.api.rerender();
  };

  protected addEventListeners() {
    this.api.canvas.addEventListener("mouseup", this.handleCanvasMouseup);
    this.api.canvas.addEventListener("mousemove", this.handleCanvasMousemove);
  }

  protected rebuildIndex(): void {
    const boxes = this._sortedMarkers.map(
      (marker): BBox & { marker: TMarker } => {
        const minX = marker.time;
        const maxX = marker.time;
        const minY = 0;
        const maxY = this.api.ctx.canvas.height;
        return { minX, maxX, minY, maxY, marker };
      },
    );
    this.index.clear();
    this.index.load(boxes);
  }

  /**
   * Collapses groups of similar markers that are closer than or equal to
   * `viewConfiguration.markers.collapseMinDistance` pixels in the current zoom level.
   */
  private collapseCloseSimilarMarkers(markers: TMarker[]): TMarker[] {
    if (!markers.length) return markers;

    const { markers: markersCfg } = this.api.getViewConfiguration();
    const list = [...markers].sort((a, b) => a.time - b.time);

    const result: TMarker[] = [];
    let group: TMarker[] = [];
    let lastX = Number.NEGATIVE_INFINITY;

    const flushGroup = () => {
      if (!group.length) return;
      if (group.length === 1) {
        result.push(group[0]);
      } else {
        const avgTime = Math.round(
          group.reduce((sum, m) => sum + m.time, 0) / group.length,
        );
        const template = group[0];
        result.push({
          ...template,
          time: avgTime,
          label: `${group.length}`,
        });
      }
      group = [];
      lastX = Number.NEGATIVE_INFINITY;
    };

    for (let i = 0; i < list.length; i += 1) {
      const cur = list[i];
      const curX = this.api.timeToPosition(cur.time);

      if (!group.length) {
        group.push(cur);
        lastX = curX;
        continue;
      }

      const closeEnough =
        Math.abs(curX - lastX) <= markersCfg.collapseMinDistance;
      if (closeEnough) {
        group.push(cur);
        lastX = curX;
      } else {
        flushGroup();
        group.push(cur);
        lastX = curX;
      }
    }

    flushGroup();
    return result;
  }
}
