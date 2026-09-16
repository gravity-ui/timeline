import { AbstractEventRenderer } from "../components/Events";
import { TimelineMarker } from "./markers";
import { TimelineSection } from "./sections";

export type TimelineEvent = {
  id: string;
  from: number;
  to?: number;
  axisId: string;
  trackIndex: number; //index in axis
  renderer?: AbstractEventRenderer;
  color?: string;
  hoverColor?: string;
  selectedColor?: string;
  /** CSS cursor displayed while the pointer is over this event. */
  cursor?: string;
};

export type BaseEventData = {
  time: number;
  relativeX: number;
  relativeY: number;
};

export type EventParams<T extends CustomEvent> = T extends CustomEvent
  ? T["detail"]
  : never;

export type ClickEvent<
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
> = {
  events: TEvent[];
  markers: TMarker[];
  sections: TSection[];
} & BaseEventData;
export type SelectEvent<TEvent extends TimelineEvent = TimelineEvent> = {
  events: TEvent[];
} & BaseEventData;
export type ContextEvent<TEvent extends TimelineEvent = TimelineEvent> = {
  event?: TEvent;
} & BaseEventData;
export type HoverEvent<
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
> = {
  events: TEvent[];
  markers: TMarker[];
  sections: TSection[];
} & BaseEventData;
export type LeaveEvent<
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
> = {
  events: TEvent[];
  markers: TMarker[];
  sections: TSection[];
};
export type CameraEvent = { from: number; to: number };
/** The visible time range after it has changed and been rendered. */
export type RangeEvent = { from: number; to: number };
export type TimelineLifecycleEvent = Record<string, never>;
export type MarkerSelectEvent<TMarker extends TimelineMarker = TimelineMarker> =
  { markers: TMarker[] } & BaseEventData;

export type GroupMarkerClickEvent<
  TMarker extends TimelineMarker = TimelineMarker,
> = {
  groupMarker: TMarker;
  originalMarkers: TMarker[];
  newInterval: { start: number; end: number };
};

export type ApiEvent<
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
> = {
  "on-click": (
    event: CustomEvent<ClickEvent<TEvent, TMarker, TSection>>,
  ) => void;
  "on-context-click": (event: CustomEvent<ContextEvent<TEvent>>) => void;
  "on-select-change": (event: CustomEvent<SelectEvent<TEvent>>) => void;
  "on-hover": (
    events: CustomEvent<HoverEvent<TEvent, TMarker, TSection>>,
  ) => void;
  "on-leave": (
    events: CustomEvent<LeaveEvent<TEvent, TMarker, TSection>>,
  ) => void;
  /**
   * Fired synchronously after `api.setRange()` changes the visible range.
   * Use it to keep another timeline in sync.
   */
  "on-range-change": (event: CustomEvent<RangeEvent>) => void;
  "on-camera-change": (event: CustomEvent<CameraEvent>) => void;
  "on-marker-select-change": (
    markers: CustomEvent<MarkerSelectEvent<TMarker>>,
  ) => void;
  "on-group-marker-click": (
    event: CustomEvent<GroupMarkerClickEvent<TMarker>>,
  ) => void;
  "on-ready": (event: CustomEvent<TimelineLifecycleEvent>) => void;
  "on-render": (event: CustomEvent<TimelineLifecycleEvent>) => void;
  "on-destroy": (event: CustomEvent<TimelineLifecycleEvent>) => void;
};

export type UnwrapTimelineEvents<
  Key extends keyof ApiEvent<TEvent, TMarker, TSection>,
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
  U extends ApiEvent<TEvent, TMarker, TSection>[Key] = ApiEvent<
    TEvent,
    TMarker,
    TSection
  >[Key],
  P extends Parameters<U>[0] = Parameters<U>[0],
> = P extends CustomEvent ? P : never;

export type UnwrapTimelineEventsDetail<
  Key extends keyof ApiEvent<TEvent, TMarker, TSection>,
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
  U extends ApiEvent<TEvent, TMarker, TSection>[Key] = ApiEvent<
    TEvent,
    TMarker,
    TSection
  >[Key],
  P extends Parameters<U>[0] = Parameters<U>[0],
> = UnwrapTimelineEvents<Key, TEvent, TMarker, TSection, U, P>["detail"];
