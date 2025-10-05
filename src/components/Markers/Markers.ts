import { pointToRangeIntersect } from "../../helpers/math";
import { CanvasApi } from "../../CanvasApi";
import {
  BaseComponentInterface,
  LabelSize,
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
} from "../../types";
import { DefaultMarkerRenderer } from "./DefaultMarkerRenderer";
import { MarkerDeselectionMode } from "../../enums";
import RBush, { BBox } from "rbush";

const MAX_INDEX_TREE_WIDTH = 16;

/**
 * Handles rendering timeline markers on the canvas
 * Implements BaseComponentInterface for a consistent component structure
 */
export class Markers<
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
> implements BaseComponentInterface
{
  protected api: CanvasApi<TEvent, TMarker, TSection>;
  protected _sortedMarkers: TMarker[] = [];
  protected _collapsedMarkers: TMarker[] = []; // Store collapsed markers separately
  protected index = new RBush<BBox & { marker: TMarker }>(MAX_INDEX_TREE_WIDTH);
  // Tracks last rendered label positions to prevent overlapping
  protected lastRenderedLabelPosition = { top: Infinity, bottom: Infinity };
  private textWidthCache = new Map<string, LabelSize>();
  private _selectedMarkers = new Set<number>();
  private hoveredMarker: number = undefined;

  constructor(api: CanvasApi<TEvent, TMarker, TSection>) {
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
    this._collapsedMarkers = []; // Reset collapsed markers
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

    // Store collapsed markers for later use
    this._collapsedMarkers = collapsedMarkers;

    // Rebuild index with both original and collapsed markers
    this.rebuildIndexWithCollapsedMarkers();

    // Render in z-index order: normal -> selected -> hovered (last = on top)
    const renderMarker = (
      marker: TMarker,
      isSelected: boolean,
      isHovered: boolean,
    ) => {
      const renderer = marker.renderer || new DefaultMarkerRenderer<TMarker>();
      renderer.render({
        ctx: this.api.ctx,
        marker,
        isSelected,
        isHovered,
        markerPosition: this.api.timeToPosition(marker.time),
        viewConfiguration: this.api.getViewConfiguration(),
        lastRenderedLabelPosition: this.lastRenderedLabelPosition,
        timeToPosition: this.api.timeToPosition,
        getLabelSize: this.getLabelSize.bind(this),
      });
    };

    // First pass: render normal markers (neither selected nor hovered)
    for (let i = collapsedMarkers.length - 1; i >= 0; i -= 1) {
      const marker = collapsedMarkers[i];
      if (
        !this.isSelectedMarker(marker.time) &&
        !this.isHoveredMarker(marker.time)
      ) {
        renderMarker(marker, false, false);
      }
    }

    // Second pass: render selected markers (on top of normal)
    for (let i = collapsedMarkers.length - 1; i >= 0; i -= 1) {
      const marker = collapsedMarkers[i];
      if (
        this.isSelectedMarker(marker.time) &&
        !this.isHoveredMarker(marker.time)
      ) {
        renderMarker(marker, true, false);
      }
    }

    // Third pass: render hovered markers (on top of all)
    for (let i = collapsedMarkers.length - 1; i >= 0; i -= 1) {
      const marker = collapsedMarkers[i];
      if (this.isHoveredMarker(marker.time)) {
        renderMarker(marker, false, true);
      }
    }
  }

  public destroy() {
    this.api.canvas.removeEventListener("mouseup", this.handleCanvasMouseup);
    this.api.canvas.removeEventListener(
      "mousemove",
      this.handleCanvasMousemove,
    );
  }

  public rebuildIndex(): void {
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
    const {
      clickMarkerCollectionFilter,
      markerDeselectionMode = MarkerDeselectionMode.ON_CLICK_ANYWHERE,
    } = this.api.getTimelineSettings();
    let candidates = this.getMarkersAtPoint(event.offsetX, event.offsetY);

    if (clickMarkerCollectionFilter) {
      candidates = clickMarkerCollectionFilter(candidates);
    }

    const times = candidates.map((marker) => marker.time);
    const arraysAreEqual =
      times.length === this._selectedMarkers.size &&
      times.every((num) => this._selectedMarkers.has(num));

    const isMarkerOnlyMode =
      markerDeselectionMode === MarkerDeselectionMode.ON_MARKER_CLICK_ONLY;

    const emitAndRender = (markers: TMarker[]) => {
      this.api.emit("on-marker-select-change", {
        markers,
        time: this.api.positionToTime(event.offsetX),
        relativeX: event.clientX,
        relativeY: event.clientY,
      });
      this.api.rerender();
    };

    if (isMarkerOnlyMode && !candidates.length) return;

    if (arraysAreEqual) {
      if (!isMarkerOnlyMode) return;

      // In ON_MARKER_CLICK_ONLY mode, clicking on the already selected marker should deselect it
      this._selectedMarkers.clear();
      emitAndRender([]);
      return;
    }

    if (candidates.length) {
      this._selectedMarkers = new Set(times);

      const groupMarker = candidates.find((marker) => Boolean(marker.group));
      if (groupMarker) {
        this.handleGroupMarkerClick(groupMarker);
      }

      emitAndRender(candidates);
      return;
    }

    if (!isMarkerOnlyMode) {
      this._selectedMarkers.clear();
      emitAndRender([]);
    }
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

  /**
   * Rebuilds the spatial index including both original and collapsed markers
   */
  protected rebuildIndexWithCollapsedMarkers(): void {
    const boxes: (BBox & { marker: TMarker })[] = [];

    // Add original markers
    for (const marker of this._sortedMarkers) {
      const minX = marker.time;
      const maxX = marker.time;
      const minY = 0;
      const maxY = this.api.ctx.canvas.height;
      boxes.push({ minX, maxX, minY, maxY, marker });
    }

    // Add collapsed markers (they might have different times due to averaging)
    for (const marker of this._collapsedMarkers) {
      if (marker.group) {
        // Only add grouped markers
        const minX = marker.time;
        const maxX = marker.time;
        const minY = 0;
        const maxY = this.api.ctx.canvas.height;
        boxes.push({ minX, maxX, minY, maxY, marker });
      }
    }

    this.index.clear();
    this.index.load(boxes);
  }

  /**
   * Collapses groups of similar markers that are closer than or equal to
   * `viewConfiguration.markers.collapseMinDistance` pixels in the current zoom level.
   *
   * This function groups markers that are visually close together and creates
   * a single representative marker for each group, improving readability.
   * @param markers - Array of markers to process
   * @returns Array of collapsed markers where close groups are merged
   */
  private collapseCloseSimilarMarkers(markers: TMarker[]): TMarker[] {
    if (!markers.length) return markers;

    const { markers: markersCfg } = this.api.getViewConfiguration();

    if (!markersCfg.collapseEnabled) return markers;

    const collapseDistance = markersCfg.collapseMinDistance;

    // Early return if collapse distance is 0 or negative (no collapsing)
    if (collapseDistance <= 0) return markers;

    // Pre-calculate positions to avoid repeated API calls
    const markersWithPositions = markers
      .map((marker) => ({
        marker,
        position: this.api.timeToPosition(marker.time),
      }))
      .sort((a, b) => a.position - b.position);

    const result: TMarker[] = [];
    let currentGroup: TMarker[] = [];
    let lastPosition = Number.NEGATIVE_INFINITY;

    const flushCurrentGroup = () => {
      if (!currentGroup.length) return;

      if (currentGroup.length === 1) {
        result.push(currentGroup[0]);
      } else {
        const avgTime = this.calculateAverageTime(currentGroup);
        const template = currentGroup[0];
        const groupedMarker = {
          ...template,
          time: avgTime,
          label: `${currentGroup.length}`,
          group: true,
        };
        result.push(groupedMarker);
      }
      currentGroup = [];
    };

    for (const { marker, position } of markersWithPositions) {
      if (!currentGroup.length) {
        currentGroup.push(marker);
        lastPosition = position;
        continue;
      }

      const isCloseEnough =
        Math.abs(position - lastPosition) <= collapseDistance;

      if (isCloseEnough) {
        currentGroup.push(marker);
        lastPosition = position;
      } else {
        flushCurrentGroup();
        currentGroup.push(marker);
        lastPosition = position;
      }
    }

    flushCurrentGroup();

    return result;
  }

  /**
   * Calculates the average time for a group of markers.
   * Used when collapsing multiple markers into a single representative marker.
   * @param markers - Array of markers to calculate average time for
   * @returns Rounded average time value
   */
  private calculateAverageTime(markers: TMarker[]): number {
    const totalTime = markers.reduce((sum, marker) => sum + marker.time, 0);
    return Math.round(totalTime / markers.length);
  }

  /**
   * Handles click on a grouped marker by zooming to show all markers in the group
   * @param groupMarker - The grouped marker that was clicked
   */
  private handleGroupMarkerClick(groupMarker: TMarker): void {
    const { markers: markersCfg } = this.api.getViewConfiguration();

    if (!markersCfg.groupZoomEnabled) return;

    const groupMarkers = this.findMarkersInGroup(groupMarker);
    if (groupMarkers.length <= 1) return;

    const { start, end } = this.calculateGroupInterval(groupMarkers);
    this.api.setRange(start, end);

    this.api.emit("on-group-marker-click", {
      groupMarker,
      originalMarkers: groupMarkers,
      newInterval: { start, end },
    });
  }

  /**
   * Finds all original markers that were collapsed into a group
   * @param groupMarker - The grouped marker to find original markers for
   * @returns Array of original markers in the group
   */
  private findMarkersInGroup(groupMarker: TMarker): TMarker[] {
    const { markers: markersCfg } = this.api.getViewConfiguration();
    const collapseDistance = markersCfg.collapseMinDistance;

    if (!collapseDistance || collapseDistance <= 0) return [groupMarker];

    const groupTime = groupMarker.time;
    const groupPosition = this.api.timeToPosition(groupTime);

    const allMarkers = [...this._sortedMarkers, ...this._collapsedMarkers];
    const foundMarkers = allMarkers.filter((marker) => {
      // Skip the group marker itself
      if (marker.group) return false;

      const markerPosition = this.api.timeToPosition(marker.time);
      const distance = Math.abs(markerPosition - groupPosition);
      return distance <= collapseDistance;
    });

    return foundMarkers;
  }

  /**
   * Calculates an optimal interval to show all markers in a group
   * @param groupMarkers - Array of markers in the group
   * @returns Object with start and end times for the new interval
   */
  private calculateGroupInterval(groupMarkers: TMarker[]): {
    start: number;
    end: number;
  } {
    const { markers } = this.api.getViewConfiguration();
    const { start: currentStart, end: currentEnd } = this.api.getInterval();
    const currentDomain = currentEnd - currentStart;

    const groupTimes = groupMarkers.map((m) => m.time);
    const minTime = Math.min(...groupTimes);
    const maxTime = Math.max(...groupTimes);

    const groupDomain = maxTime - minTime;

    const padding = Math.max(groupDomain * markers.groupZoomPadding, 1000);

    let newStart = minTime - padding;
    let newEnd = maxTime + padding;

    const newDomain = newEnd - newStart;
    const maxFactor = markers.groupZoomMaxFactor;

    if (newDomain > currentDomain * maxFactor) {
      // If the new domain is too large, center the group in the current view
      const center = (minTime + maxTime) / 2;
      const halfDomain = (currentDomain * maxFactor) / 2;
      newStart = center - halfDomain;
      newEnd = center + halfDomain;
    }

    return { start: Math.round(newStart), end: Math.round(newEnd) };
  }
}
