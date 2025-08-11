import { LabelSize, TimelineMarker, ViewConfiguration } from "../../types";

export abstract class AbstractMarkerRenderer {
  public abstract render(data: {
    ctx: CanvasRenderingContext2D;
    marker: TimelineMarker;
    isSelected: boolean;
    isHovered: boolean;
    markerPosition: number;
    viewConfiguration: ViewConfiguration;
    lastRenderedLabelPosition: { top: number; bottom: number };
    timeToPosition: (n: number) => number;
    getLabelSize: (label: string) => LabelSize;
  }): void;
}
