import { clamp } from "../helpers/math";
import { AxesIndex } from "../lib/AxesIndex";
import { BaseComponentInterface } from "../types/component";
import { CanvasApi } from "../CanvasApi";
import { TimelineAxis } from "../types/axis";
import { StrokeMode } from "../enums";

/**
 * Axes component responsible for managing and rendering timeline axes
 * Implements BaseComponentInterface for consistent component structure
 * @template Axis - Type of axis extending TimelineAxis
 */
export class Axes<Axis extends TimelineAxis = TimelineAxis>
  implements BaseComponentInterface
{
  public strokeMode = StrokeMode.STRAIGHT;
  private api: CanvasApi;
  private axesIndex!: AxesIndex<Axis>;

  constructor(api: CanvasApi) {
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

    const { axes } = this.api.getVisualConfiguration();
    const index = clamp(trackIndex, 0, axis.tracksCount - 1);
    return axis.top + axes.trackHeight * index + axes.trackHeight / 2;
  }

  /**
   * Renders all axes to the canvas
   */
  public render() {
    const { ruler, axes } = this.api.getVisualConfiguration();
    const { ctx } = this.api;

    if (this.strokeMode === StrokeMode.DASHED) {
      ctx.setLineDash(axes.dashedLinePattern);
    }

    this.api.useScrollTransform();
    ctx.translate(0, ruler.height);

    const canvasWidth = ctx.canvas.width;
    ctx.strokeStyle = axes.color.line;
    ctx.beginPath();
    ctx.lineWidth = axes.lineWidth;

    for (const axis of this.axesIndex.sortedAxes) {
      for (let i = 0; i < axis.tracksCount; i += 1) {
        const y = this.getAxisTrackPosition(axis, i);
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
      }
    }

    ctx.stroke();
    ctx.setLineDash(axes.solidLinePattern);
  }
}
