import { TimelineAxis } from "./axis";
import { TimelineEvent } from "./events";

export type RulerViewOptions = {
  spacing?: number;
  position?: number;
  subPosition?: number;
  height?: number;
  font?: string;
  color?: {
    background?: string;
    primaryLevel?: string;
    secondaryLevel?: string;
    textOutlineColor?: string;
    borderColor?: string;
    rulerWeekendColor?: string;
  };
};

export type GridViewOptions = {
  spacing?: number;
  lineWidth?: number;
  widthBuffer?: number;
  color?: {
    primaryMarkColor?: string;
    secondaryMarkColor?: string;
    boundaryMarkColor?: string;
  };
};

export type AxesViewOptions = {
  trackHeight?: number;
  lineHeight?: number;
  lineWidth?: number;
  color?: {
    line?: string;
  };
  dashedLinePattern?: [number, number];
  solidLinePattern?: [number, number];
};

export type EnetsViewOptions = {
  hitboxPadding?: number;
  font?: string;
  maxIndexTreeWidth?: number;
};

export type MarkerViewOptions = {
  labelPadding?: number;
  labelHeight?: number;
  labelFont?: string;
  textPadding?: number;
  markerWidth?: number;
  color?: {
    textColor?: string;
  };
};

export type ViewConfiguration = {
  ruler?: RulerViewOptions;
  grid?: GridViewOptions;
  axes?: AxesViewOptions;
  events?: EnetsViewOptions;
  markers?: MarkerViewOptions;
  hideRuler?: boolean;
};

export type BaseEventData = {
  time: number;
  relativeX: number;
  relativeY: number;
};

export type TimelineSettings = {
  start: number;
  end: number;
  axes: TimelineAxis[];
  events: TimelineEvent[];
};

export type TimeLineConfig = {
  settings: TimelineSettings;
  viewConfiguration?: ViewConfiguration;
};

type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type ViewConfigurationDefault = DeepRequired<ViewConfiguration>;
