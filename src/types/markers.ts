import { AbstractMarkerRenderer } from "../components/Markers/AbstractMarkerRenderer";

export type TimelineMarker = {
  time: number;
  color: string;
  lineWidth?: number;
  label?: string;
  labelColor?: string;
  renderer?: AbstractMarkerRenderer;
};

export type LabelSize = { height: number; width: number };
