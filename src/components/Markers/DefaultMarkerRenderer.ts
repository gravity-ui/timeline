import { AbstractMarkerRenderer } from "./AbstractMarkerRenderer";
import {
  CanvasColorResolver,
  CanvasFontResolver,
  LabelSize,
  TimelineMarker,
  ViewConfiguration,
} from "../../types";
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
    resolveColor,
    resolveFont,
  }: {
    ctx: CanvasRenderingContext2D;
    marker: TMarker;
    isSelected: boolean;
    isHovered: boolean;
    markerPosition: number;
    viewConfiguration: ViewConfiguration;
    lastRenderedLabelPosition: { top: number; bottom: number };
    getLabelSize: (label: string) => LabelSize;
    resolveColor?: CanvasColorResolver;
    resolveFont?: CanvasFontResolver;
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
    const resolvedColor = resolveColor ? resolveColor(color) : color;

    let labelAreaHeight = 0;
    if (marker.label) {
      const labelSize = getLabelSize(marker.label);
      labelAreaHeight = labelSize.height + DEFAULT_LABEL_PADDING * 2;

      this.renderLabel(
        ctx,
        resolvedColor,
        isSelected,
        isHovered,
        marker,
        markerPosition,
        labelSize,
        viewConfiguration.markers,
        lastRenderedLabelPosition,
        resolveColor,
        resolveFont,
      );
    }

    ctx.strokeStyle = resolvedColor;
    ctx.lineWidth = marker.lineWidth || DEFAULT_LINE_WIDTH;
    ctx.beginPath();

    ctx.moveTo(markerPosition, labelAreaHeight);
    ctx.lineTo(markerPosition, ctx.canvas.height);
    ctx.stroke();
  }

  protected renderLabel(
    ctx: CanvasRenderingContext2D,
    color: string,
    isSelected: boolean,
    isHovered: boolean,
    marker: TimelineMarker,
    markerPosition: number,
    labelSize: LabelSize,
    markerConfiguration: ViewConfiguration["markers"],
    lastRenderedLabelPosition: { top: number; bottom: number },
    resolveColor?: CanvasColorResolver,
    resolveFont?: CanvasFontResolver,
  ) {
    const { width, height } = labelSize;
    const widthWithPadding = width + DEFAULT_LABEL_PADDING * 2;
    const heightWithPadding = height + DEFAULT_LABEL_PADDING * 2;

    const isActive = isSelected || isHovered;
    const labelPosition = this.calculateSelectedLabelPosition(
      markerPosition,
      widthWithPadding,
      isActive
        ? ctx.canvas.width
        : Math.min(ctx.canvas.width, lastRenderedLabelPosition["top"]),
    );

    if (markerPosition < lastRenderedLabelPosition["top"] || isActive) {
      if (isActive) lastRenderedLabelPosition["top"] = labelPosition;
      this.drawLabelContent(
        ctx,
        color,
        marker,
        labelPosition,
        widthWithPadding,
        heightWithPadding,
        height,
        markerConfiguration,
        resolveColor,
        resolveFont,
      );
    }
  }

  private calculateSelectedLabelPosition(
    markerPosition: number,
    widthWithPadding: number,
    width: number,
  ): number {
    return clamp(
      markerPosition - widthWithPadding / 2,
      0,
      width - widthWithPadding,
    );
  }

  private drawLabelContent(
    ctx: CanvasRenderingContext2D,
    color: string,
    marker: TimelineMarker,
    labelPosition: number,
    widthWithPadding: number,
    heightWithPadding: number,
    height: number,
    markerConfiguration: ViewConfiguration["markers"],
    resolveColor?: CanvasColorResolver,
    resolveFont?: CanvasFontResolver,
  ): void {
    ctx.font = resolveFont
      ? resolveFont(markerConfiguration.font)
      : markerConfiguration.font;
    ctx.fillStyle = color;
    ctx.fillRect(labelPosition, 0, widthWithPadding, heightWithPadding);
    const labelColor = marker.labelColor || DEFAULT_TEXT_COLOR;
    ctx.fillStyle = resolveColor
      ? resolveColor(labelColor, DEFAULT_TEXT_COLOR)
      : labelColor;
    ctx.fillText(
      marker.label,
      labelPosition + DEFAULT_LABEL_PADDING,
      height + DEFAULT_LABEL_PADDING,
    );
  }
}
