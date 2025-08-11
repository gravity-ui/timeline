import { TimelineAxis } from "./axis";
import { TimelineEvent } from "./events";
import { TimelineMarker } from "./markers";

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

export type EventsViewOptions = {
  font?: string;
  hitboxPadding?: number;
};

export type MarkerViewOptions = {
  font?: string;
  hitboxPadding?: number;
  collapseMinDistance?: number;
};

export type ViewConfiguration = {
  ruler?: RulerViewOptions;
  grid?: GridViewOptions;
  axes?: AxesViewOptions;
  events?: EventsViewOptions;
  markers?: MarkerViewOptions;
  hideRuler?: boolean;
};

export type TimelineSettings<TEvent extends TimelineEvent> = {
  start: number;
  end: number;
  axes: TimelineAxis[];
  events: TEvent[];
  markers?: TimelineMarker[];
  selectedEventIds?: string[];
};

export type TimeLineConfig<TEvent extends TimelineEvent> = {
  settings: TimelineSettings<TEvent>;
  viewConfiguration?: ViewConfiguration;
};

type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type ViewConfigurationDefault = DeepRequired<ViewConfiguration>;
