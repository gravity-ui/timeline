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

export type AxesLinePosition = "center" | "between";

export type AxesViewOptions = {
  /**
   * Vertical position of horizontal axis lines within a track.
   * `center` draws through the track center; `between` draws at its bottom boundary.
   */
  linePosition?: AxesLinePosition;
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

export type CameraInteractionAction = "zoom" | "pan" | "pass-through";

export type CameraInteractions = {
  verticalWheel?: CameraInteractionAction;
  horizontalWheel?: CameraInteractionAction;
  pinch?: CameraInteractionAction;
};

/**
 * Multiplies the zoom step for each direction. `1` keeps the default speed.
 */
export type ZoomSensitivity = {
  in?: number;
  out?: number;
};

export type CameraViewOptions = {
  zoom?: ZoomMode;
  interactions?: CameraInteractions;
  zoomSensitivity?: ZoomSensitivity;
  /** Minimum zoomable time range in milliseconds. Defaults to 5 seconds. */
  minRange?: number;
  /** Maximum zoomable time range in milliseconds. Defaults to no limit. */
  maxRange?: number;
};

export type CameraViewOptionsDefault = {
  zoom: ZoomMode;
  interactions: CameraInteractions;
  zoomSensitivity: Required<ZoomSensitivity>;
  minRange?: number;
  maxRange?: number;
};

export type ViewConfiguration = {
  /**
   * Default font for ruler, events, and markers. Local component font settings
   * take precedence. Supports CSS custom properties and the `inherit` sentinel.
   */
  font?: string;
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

export type ViewConfigurationDefault = DeepRequired<
  Omit<ViewConfiguration, "camera">
> & {
  camera: CameraViewOptionsDefault;
};
