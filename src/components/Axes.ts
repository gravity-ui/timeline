import { clamp, rangeToRangeIntersect } from "../helpers/math";
import { AxesIndex } from "../lib/AxesIndex";
import { CanvasApi } from "../CanvasApi";
import { StrokeMode } from "../enums";
import {
  BaseComponentInterface,
  TimelineAxis,
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
} from "../types";

/**
 * Axes component responsible for managing and rendering timeline axes
 * Implements BaseComponentInterface for consistent component structure
 * @template Axis - Type of axis extending TimelineAxis
 */
export class Axes<
  Axis extends TimelineAxis = TimelineAxis,
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
> implements BaseComponentInterface
{
  public strokeMode = StrokeMode.STRAIGHT;
  private api: CanvasApi<TEvent, TMarker, TSection>;
  private axesIndex!: AxesIndex<Axis>;

  constructor(api: CanvasApi<TEvent, TMarker, TSection>) {
    this.api = api;

    this.axesIndex = new AxesIndex<Axis>([], {
      identityFunction: (axis: Axis) => axis.id,
    });
  }

  /**
   * Replaces all axes with a new set and triggers re-render
   * @param newAxes - Array of new axes to display
   * @throws Error if newAxes is not an array
   */
  public setAxes(newAxes: Axis[]) {
    if (!newAxes || !Array.isArray(newAxes)) {
      throw new Error("Axes must be an array");
    }

    this.axesIndex.axes = newAxes;
    this.render();
  }

  /**
   * Gets all axes indexed by their ID for quick lookup
   * @returns Record mapping axis IDs to axis objects
   */
  public getAxesById(): Record<string, Axis> {
    return this.axesIndex.axesById;
  }

  /**
   * Calculates vertical position for a track within an axis
   * @param axis - Axis containing the track
   * @param trackIndex - Index of the track within the axis
   * @returns Y coordinate of the track's center
   * @throws Error if axis is invalid or trackIndex is out of bounds
   */
  public getAxisTrackPosition(axis: Axis, trackIndex: number): number {
    if (!axis || axis.tracksCount < 0) {
      throw new Error("Invalid axis configuration");
    }

    const { axes } = this.api.getViewConfiguration();
    const index = clamp(trackIndex, 0, axis.tracksCount - 1);
    return axis.top + axes.trackHeight * index + axes.trackHeight / 2;
  }

  /**
   * Renders all axes to the canvas
   */
  public render() {
    const { axes } = this.api.getViewConfiguration();
    const { ctx } = this.api;

    if (this.strokeMode === StrokeMode.DASHED) {
      ctx.setLineDash(axes.dashedLinePattern);
    }

    this.api.useScrollTransform();
    ctx.translate(0, this.api.getRulerHeight());

    const canvasWidth = ctx.canvas.width;
    ctx.strokeStyle = axes.color.line;
    ctx.beginPath();
    ctx.lineWidth = axes.lineWidth;

    const camera = this.api.getCameraPosition();
    const visibleAxes = this.axesIndex.sortedAxes.filter((axis) => {
      return rangeToRangeIntersect(
        axis.top,
        axis.top + axis.tracksCount * axes.trackHeight,
        camera.y0,
        camera.y1,
      );
    });

    for (const axis of visibleAxes) {
      for (let i = 0; i < axis.tracksCount; i += 1) {
        const y = this.getAxisTrackPosition(axis, i);
        // Check if this track is within the camera's field of view
        if (y >= camera.y0 && y <= camera.y1) {
          ctx.moveTo(0, y);
          ctx.lineTo(canvasWidth, y);
        }
      }
    }

    ctx.stroke();
    ctx.setLineDash(axes.solidLinePattern);
  }
}
