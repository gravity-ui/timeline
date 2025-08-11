import { AbstractMarkerRenderer } from "./AbstractMarkerRenderer";
import { LabelSize, TimelineMarker, ViewConfiguration } from "../../types";
import { clamp } from "../../helpers/math";

const DEFAULT_LINE_WIDTH = 1;
const DEFAULT_TEXT_COLOR = "#333";
const DEFAULT_ACTIVE_COLOR = "red";
const DEFAULT_HOVER_COLOR = "yellow";
const DEFAULT_LABEL_PADDING = 4;

export class DefaultMarkerRenderer<
  TMarker extends TimelineMarker,
> extends AbstractMarkerRenderer<TMarker> {
  public render({
    ctx,
    isSelected,
    isHovered,
    marker,
    markerPosition,
    viewConfiguration,
    lastRenderedLabelPosition,
    getLabelSize,
  }: {
    ctx: CanvasRenderingContext2D;
    marker: TMarker;
    isSelected: boolean;
    isHovered: boolean;
    markerPosition: number;
    viewConfiguration: ViewConfiguration;
    lastRenderedLabelPosition: { top: number; bottom: number };
    getLabelSize: (label: string) => LabelSize;
  }) {
    const activeColor = marker.activeColor || DEFAULT_ACTIVE_COLOR;
    const hoverColor = marker.hoverColor || DEFAULT_HOVER_COLOR;

    let color = isHovered ? hoverColor : marker.color;
    if (isSelected) {
      color = activeColor;
    }

    // Draw marker line
    ctx.strokeStyle = color;
    ctx.lineWidth = marker.lineWidth || DEFAULT_LINE_WIDTH;
    ctx.beginPath();
    ctx.moveTo(markerPosition, 0);
    ctx.lineTo(markerPosition, ctx.canvas.height);
    ctx.stroke();

    if (!marker.label) return;

    // Render the top label if present
    this.renderLabel(
      ctx,
      color,
      marker,
      markerPosition,
      viewConfiguration.markers,
      lastRenderedLabelPosition,
      getLabelSize,
    );
  }

  protected renderLabel(
    ctx: CanvasRenderingContext2D,
    color: string,
    marker: TimelineMarker,
    markerPosition: number,
    markerConfiguration: ViewConfiguration["markers"],
    lastRenderedLabelPosition: { top: number; bottom: number },
    getLabelSize: (label: string) => LabelSize,
  ) {
    const { width, height } = getLabelSize(marker.label);
    const widthWithPadding = width + DEFAULT_LABEL_PADDING * 2;
    const heightWithPadding = height + DEFAULT_LABEL_PADDING * 2;

    const labelPosition = clamp(
      markerPosition - widthWithPadding / 2, // Center label on marker
      0, // Don't go past the left edge
      Math.min(ctx.canvas.width, lastRenderedLabelPosition["top"]) -
        widthWithPadding, // Don't overlap previous labels
    );

    // Only render if we have space (right-to-left rendering)
    if (markerPosition < lastRenderedLabelPosition["top"]) {
      // if (markerPosition > lastRenderedLabelPosition["top"]) {
      lastRenderedLabelPosition["top"] = labelPosition;
      ctx.font = markerConfiguration.font;
      ctx.fillStyle = color;
      ctx.fillRect(labelPosition, 0, widthWithPadding, heightWithPadding);

      //Draw label text
      ctx.fillStyle = marker.labelColor || DEFAULT_TEXT_COLOR;
      ctx.fillText(
        marker.label,
        labelPosition + DEFAULT_LABEL_PADDING,
        height + DEFAULT_LABEL_PADDING,
      );
    }
  }
}
