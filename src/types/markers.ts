import { AbstractMarkerRenderer } from "../components/Markers/AbstractMarkerRenderer";

export type TimelineMarker = {
  time: number;
  color: string;
  activeColor: string;
  hoverColor: string;
  lineWidth?: number;
  label?: string;
  labelColor?: string;
  renderer?: AbstractMarkerRenderer;
  nonSelectable?: boolean;
  group?: boolean;
};

export type LabelSize = { height: number; width: number };
