import { AbstractMarkerRenderer } from "../components/Markers/AbstractMarkerRenderer";
import { LabelSize, TimelineMarker, ViewConfiguration } from "../types";
import { clamp } from "../helpers/math";

export type MyMarker = TimelineMarker & {
  activeColor: string;
  hoverColor: string;
  lineWidth: number;
};

const DEFAULT_LABEL_PADDING = 4;

export class MyMarkerRenderer<
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
    let color = isHovered ? marker.hoverColor : marker.color;
    if (isSelected) {
      color = marker.activeColor;
    }

    // Draw marker line
    ctx.strokeStyle = color;
    ctx.lineWidth = marker.lineWidth;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(markerPosition, 0);
    ctx.lineTo(markerPosition, ctx.canvas.height);
    ctx.stroke();

    if (!marker.label) return;

    if (isHovered || isSelected) {
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
    //
    const labelPosition = clamp(
      markerPosition - widthWithPadding / 2, // Center label on marker
      0, // Don't go past the left edge
      Math.min(ctx.canvas.width, lastRenderedLabelPosition["top"]) -
        widthWithPadding, // Don't overlap previous labels
    );

    ctx.font = markerConfiguration.font;
    ctx.fillStyle = color;
    ctx.roundRect(labelPosition, 0, widthWithPadding, heightWithPadding, 4);
    ctx.fill();

    //Draw label text
    ctx.fillStyle = marker.labelColor;
    ctx.fillText(
      marker.label,
      labelPosition + DEFAULT_LABEL_PADDING,
      height + DEFAULT_LABEL_PADDING,
    );
  }
}
