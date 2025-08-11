import { LabelSize, TimelineMarker, ViewConfiguration } from "../../types";

export abstract class AbstractMarkerRenderer<
  TMarker extends TimelineMarker = TimelineMarker,
> {
  public abstract render(data: {
    ctx: CanvasRenderingContext2D;
    marker: TMarker;
    isSelected: boolean;
    isHovered: boolean;
    markerPosition: number;
    viewConfiguration: ViewConfiguration;
    lastRenderedLabelPosition: { top: number; bottom: number };
    timeToPosition: (n: number) => number;
    getLabelSize: (label: string) => LabelSize;
  }): void;
}
