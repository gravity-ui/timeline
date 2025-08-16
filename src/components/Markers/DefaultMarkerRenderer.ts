import { AbstractMarkerRenderer } from "./AbstractMarkerRenderer";
import { LabelSize, TimelineMarker, ViewConfiguration } from "../../types";
import { clamp } from "../../helpers/math";

const DEFAULT_LINE_WIDTH = 1;
const DEFAULT_TEXT_COLOR = "#333";
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
    const { markers } = viewConfiguration;
    const activeColor = marker.group ? markers.groupColor : marker.activeColor;
    const hoverColor = marker.group
      ? markers.groupColorHover
      : marker.hoverColor;

    let color = isHovered ? hoverColor : marker.color;
    if (isSelected) {
      color = activeColor;
    }

    let labelAreaHeight = 0;
    if (marker.label) {
      const labelSize = getLabelSize(marker.label);
      labelAreaHeight = labelSize.height + DEFAULT_LABEL_PADDING * 2;

      this.renderLabel(
        ctx,
        color,
        marker,
        markerPosition,
        labelSize,
        viewConfiguration.markers,
        lastRenderedLabelPosition,
      );
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = marker.lineWidth || DEFAULT_LINE_WIDTH;
    ctx.beginPath();

    ctx.moveTo(markerPosition, labelAreaHeight);
    ctx.lineTo(markerPosition, ctx.canvas.height);
    ctx.stroke();
  }

  protected renderLabel(
    ctx: CanvasRenderingContext2D,
    color: string,
    marker: TimelineMarker,
    markerPosition: number,
    labelSize: LabelSize,
    markerConfiguration: ViewConfiguration["markers"],
    lastRenderedLabelPosition: { top: number; bottom: number },
  ) {
    const { width, height } = labelSize;
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
