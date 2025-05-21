import { TimelineAxis } from "./axis";
import { TimelineEvent } from "./event";

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
  };
};

export type GridViewOptions = {
  spacing?: number;
  lineWidth?: number;
  widthBuffer?: number;
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

export type ViewConfiguration = {
  ruler?: RulerViewOptions;
  grid?: GridViewOptions;
  axes?: AxesViewOptions;
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
  onClick?: (data: { events: TimelineEvent[] } & BaseEventData) => void;
  onContextMenu?: (data: { event?: TimelineEvent } & BaseEventData) => void;
  onSelectChange?: (events: TimelineEvent[]) => void;
  onHover?: (data: { event: TimelineEvent } & BaseEventData) => void;
  onLeave?: (event: TimelineEvent) => void;
};

export type TimeLineConfig = {
  settings: TimelineSettings;
  viewConfiguration?: ViewConfiguration;
};

type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type ViewConfigurationDefault = DeepRequired<ViewConfiguration>;

// export type DefaultTimeLineOptions = Required<TimeLineConfig> & {
//   ruler: Required<RulerOptions> & {
//     color: Required<Required<RulerOptions>["color"]>;
//   };
//   grid: Required<GridOptions>;
//   axes?: AxesOptions;
// };
