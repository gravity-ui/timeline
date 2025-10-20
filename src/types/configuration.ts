import { TimelineAxis } from "./axis";
import { TimelineEvent } from "./events";
import { TimelineMarker } from "./markers";
import { MarkerDeselectionMode, ZoomMode } from "../enums";
import { TimelineSection } from "./sections";
import { RulerLevel } from "./ruler";

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

export type SectionViewOptions = {
  hitboxPadding?: number;
};

export type EventsViewOptions = {
  font?: string;
  hitboxPadding?: number;
};

export type MarkerViewOptions = {
  font?: string;
  groupColor?: string;
  groupColorHover?: string;
  hitboxPadding?: number;
  collapseMinDistance?: number;
  collapseEnabled?: boolean;
  groupZoomEnabled?: boolean;
  groupZoomPadding?: number;
  groupZoomMaxFactor?: number;
};

export type CameraViewOptions = {
  zoom: ZoomMode;
};

export type ViewConfiguration = {
  ruler?: RulerViewOptions;
  grid?: GridViewOptions;
  axes?: AxesViewOptions;
  sections?: SectionViewOptions;
  events?: EventsViewOptions;
  markers?: MarkerViewOptions;
  camera?: CameraViewOptions;
  hideRuler?: boolean;
};

export type TimelineSettings<
  TEvent extends TimelineEvent,
  TMarker extends TimelineMarker,
  TSection extends TimelineSection,
> = {
  start: number;
  end: number;
  axes: TimelineAxis[];
  events: TEvent[];
  markers?: TMarker[];
  sections?: TSection[];
  selectedEventIds?: string[];
  markerDeselectionMode?: MarkerDeselectionMode;
  customLevelLabels?: (
    config: ViewConfigurationDefault["ruler"],
  ) => RulerLevel[];
  clickEventsCollectionFilter?: (candidates: TEvent[]) => TEvent[];
  clickMarkerCollectionFilter?: (candidates: TMarker[]) => TMarker[];
};

export type TimeLineConfig<
  TEvent extends TimelineEvent,
  TMarker extends TimelineMarker,
  TSection extends TimelineSection,
> = {
  settings: TimelineSettings<TEvent, TMarker, TSection>;
  viewConfiguration?: ViewConfiguration;
};

type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type ViewConfigurationDefault = DeepRequired<ViewConfiguration>;
