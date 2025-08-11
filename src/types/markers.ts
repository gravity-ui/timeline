import { AbstractMarkerRenderer } from "../components/Markers/AbstractMarkerRenderer";

export type TimelineMarker = {
  time: number;
  color: string;
  activeColor?: string;
  lineWidth?: number;
  label?: string;
  labelColor?: string;
  renderer?: AbstractMarkerRenderer;
  nonSelectable?: boolean;
};

export type LabelSize = { height: number; width: number };
