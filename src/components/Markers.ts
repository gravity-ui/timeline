import { clamp, pointToRangeIntersect } from "../helpers/math";
import { BaseComponentInterface } from "../types/component";
import { TimelineMarker } from "../types/markers";
import { CanvasApi } from "../CanvasApi";

/**
 * Handles rendering timeline markers on the canvas
 * Implements BaseComponentInterface for consistent component structure
 */
export class Markers implements BaseComponentInterface {
  protected api: CanvasApi;
  protected sortedMarkers: TimelineMarker[] = [];
  // Tracks last rendered label positions to prevent overlapping
  protected lastRenderedLabelPosition = { top: Infinity, bottom: Infinity };
  private textWidthCache = new Map<string, number>();

  constructor(api: CanvasApi) {
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
   * Renders all visible markers within current viewport
   */
  public render() {
    this.api.useStaticTransform();
    // Reset label positions for new render pass
    this.lastRenderedLabelPosition = { top: Infinity, bottom: Infinity };

    const { markers } = this.api.getVisualConfiguration();
    const { start, end } = this.api.getInterval();

    // Render markers in reverse order for proper label placement
    for (let i = this.sortedMarkers.length - 1; i >= 0; i -= 1) {
      const marker = this.sortedMarkers[i];
      let overscan = 0;

      // Calculate extra space needed for labels
      if (marker.label) {
        overscan = this.api.widthToTime(
          this.api.ctx.measureText(marker.label).width + markers.labelPadding,
        );
      }

      // Only render markers visible in current view (with overscan for labels)
      if (
        pointToRangeIntersect(marker.time, start - overscan, end + overscan)
      ) {
        this.renderMarker(marker);
      }
    }
  }

  /**
   * Renders a single marker and its labels
   * @param marker - Marker data to render
   */
  protected renderMarker(marker: TimelineMarker) {
    const { markers } = this.api.getVisualConfiguration();
    const ctx = this.api.ctx;
    const markerPosition = this.api.timeToPosition(marker.time);

    // Draw marker line
    ctx.strokeStyle = marker.color;
    ctx.lineWidth = marker.width ?? markers.markerWidth;
    ctx.beginPath();
    ctx.moveTo(markerPosition, marker.label ? markers.labelHeight : 0);
    ctx.lineTo(markerPosition, ctx.canvas.height);
    ctx.stroke();

    // Render top label if present
    if (marker.label) {
      this.renderLabel(
        markerPosition,
        {
          label: marker.label,
          backgroundColor: marker.labelBackgroundColor ?? marker.color,
          textColor: marker.labelTextColor,
        },
        "top",
      );
    }

    // Render bottom label if present
    if (marker.labelBottom) {
      this.renderLabel(
        markerPosition,
        {
          label: marker.labelBottom,
          backgroundColor: marker.labelBottomBackgroundColor ?? marker.color,
          textColor: marker.labelBottomTextColor,
        },
        "bottom",
      );
    }
  }

  /**
   * Renders a marker label with collision avoidance using a right-to-left rendering strategy.
   * Positions labels to prevent overlap with previously rendered labels and canvas boundaries.
   * @param {number} markerPosition - X position of the marker on the canvas
   * @param {object} labelData - Label content and styling information
   * @param {string} labelData.label - Text content of the label
   * @param {string} labelData.backgroundColor - Background color for the label
   * @param {string} [labelData.textColor] - Text color for the label (falls back to default if not provided)
   * @param {'top' | 'bottom'} position - Vertical position of the label on the canvas
   */
  protected renderLabel(
    markerPosition: number,
    {
      label,
      backgroundColor,
      textColor,
    }: { label: string; backgroundColor: string; textColor?: string },
    position: "top" | "bottom",
  ) {
    const { markers } = this.api.getVisualConfiguration();
    const ctx = this.api.ctx;
    const labelWidth = this.getLabelWidth(label);

    // Calculate label position with clamping to prevent overflow
    const labelPosition = clamp(
      markerPosition - labelWidth / 2, // Center label on marker
      0, // Don't go past left edge
      Math.min(ctx.canvas.width, this.lastRenderedLabelPosition[position]) -
        labelWidth, // Don't overlap previous labels
    );

    // Only render if we have space (right-to-left rendering)
    if (markerPosition < this.lastRenderedLabelPosition[position]) {
      ctx.font = markers.labelFont;
      this.lastRenderedLabelPosition[position] = labelPosition;

      // Draw label background
      ctx.fillStyle = backgroundColor;
      const y =
        position === "top" ? 0 : ctx.canvas.clientHeight - markers.labelHeight;
      ctx.fillRect(labelPosition, y, labelWidth, markers.labelHeight);

      // Draw label text
      ctx.fillStyle = textColor || markers.color.textColor;
      ctx.fillText(
        label,
        labelPosition + markers.labelPadding,
        y + markers.textPadding,
      );
    }
  }

  protected getLabelWidth(text: string) {
    if (this.textWidthCache.has(text)) {
      return this.textWidthCache.get(text);
    }

    const { markers } = this.api.getVisualConfiguration();
    const width =
      this.api.ctx.measureText(text).width + markers.labelPadding * 2;
    this.textWidthCache.set(text, width);
    return width;
  }
}
