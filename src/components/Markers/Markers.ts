import { pointToRangeIntersect } from "../../helpers/math";
import { BaseComponentInterface } from "../../types/component";
import { LabelSize, TimelineMarker } from "../../types/markers";
import { CanvasApi } from "../../CanvasApi";
import { TimelineEvent } from "../../types";
import { DefaultMarkerRenderer } from "./DefaultMarkerRenderer";

/**
 * Handles rendering timeline markers on the canvas
 * Implements BaseComponentInterface for a consistent component structure
 */
export class Markers<TEvent extends TimelineEvent = TimelineEvent>
  implements BaseComponentInterface
{
  protected api: CanvasApi<TEvent>;
  protected sortedMarkers: TimelineMarker[] = [];
  // Tracks last rendered label positions to prevent overlapping
  protected lastRenderedLabelPosition = { top: Infinity, bottom: Infinity };
  private textWidthCache = new Map<string, LabelSize>();

  constructor(api: CanvasApi<TEvent>) {
    this.api = api;
  }

  /**
   * Updates markers data and triggers re-render
   * @param markers - Array of timeline markers to display
   */
  public setMarkers(markers: TimelineMarker[]) {
    // Sort markers by time for efficient rendering
    this.sortedMarkers = markers.slice().sort((a, b) => a.time - b.time);
    this.render();
  }

  /**
   * Renders all visible markers within the current viewport
   */
  public render() {
    this.api.useStaticTransform();
    // Reset label positions for new render pass
    this.lastRenderedLabelPosition = { top: Infinity, bottom: Infinity };

    const { start, end } = this.api.getInterval();

    const visibleMarkers: TimelineMarker[] = [];
    for (let i = 0; i < this.sortedMarkers.length; i += 1) {
      const marker = this.sortedMarkers[i];
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
      const renderer = marker.renderer || new DefaultMarkerRenderer();
      renderer.render({
        ctx: this.api.ctx,
        marker,
        isSelected: false,
        markerPosition: this.api.timeToPosition(marker.time),
        viewConfiguration: this.api.getViewConfiguration(),
        lastRenderedLabelPosition: this.lastRenderedLabelPosition,
        timeToPosition: this.api.timeToPosition,
        getLabelSize: this.getLabelSize.bind(this),
      });
    }
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

  /**
   * Collapses groups of similar markers that are closer than or equal to
   * `viewConfiguration.markers.collapseMinDistance` pixels in the current zoom level.
   */
  private collapseCloseSimilarMarkers(
    markers: TimelineMarker[],
  ): TimelineMarker[] {
    if (!markers.length) return markers;

    const { markers: markersCfg } = this.api.getViewConfiguration();
    const list = [...markers].sort((a, b) => a.time - b.time);

    const result: TimelineMarker[] = [];
    let group: TimelineMarker[] = [];
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
