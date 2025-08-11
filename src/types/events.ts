import { AbstractEventRenderer } from "../components/Events";
import { TimelineMarker } from "./markers";

export type TimelineEvent = {
  id: string;
  from: number;
  to?: number;
  axisId: string;
  trackIndex: number; //index in axis
  renderer?: AbstractEventRenderer;
  color?: string;
  selectedColor?: string;
};

export type BaseEventData = {
  time: number;
  relativeX: number;
  relativeY: number;
};

export type EventParams<T extends CustomEvent> = T extends CustomEvent
  ? T["detail"]
  : never;

export type ClickEvent<TEvent extends TimelineEvent = TimelineEvent> = {
  events: TEvent[];
} & BaseEventData;
export type SelectEvent<TEvent extends TimelineEvent = TimelineEvent> = {
  events: TEvent[];
} & BaseEventData;
export type ContextEvent<TEvent extends TimelineEvent = TimelineEvent> = {
  event?: TEvent;
} & BaseEventData;
export type HoverEvent<TEvent extends TimelineEvent = TimelineEvent> = {
  events: TEvent[];
} & BaseEventData;
export type LeaveEvent<TEvent extends TimelineEvent = TimelineEvent> = {
  events: TEvent[];
};
export type CameraEvent = { from: number; to: number };
export type MarkerSelectEvent = { markers: TimelineMarker[] } & BaseEventData;

export type ApiEvent<TEvent extends TimelineEvent = TimelineEvent> = {
  "on-click": (event: CustomEvent<ClickEvent<TEvent>>) => void;
  "on-context-click": (event: CustomEvent<ContextEvent<TEvent>>) => void;
  "on-select-change": (event: CustomEvent<SelectEvent<TEvent>>) => void;
  "on-hover": (events: CustomEvent<HoverEvent<TEvent>>) => void;
  "on-leave": (events: CustomEvent<LeaveEvent<TEvent>>) => void;
  "on-camera-change": (event: CustomEvent<CameraEvent>) => void;
  "on-marker-select-change": (markers: CustomEvent<MarkerSelectEvent>) => void;
};

export type UnwrapTimelineEvents<
  Key extends keyof ApiEvent<TEvent>,
  TEvent extends TimelineEvent = TimelineEvent,
  U extends ApiEvent<TEvent>[Key] = ApiEvent<TEvent>[Key],
  P extends Parameters<U>[0] = Parameters<U>[0],
> = P extends CustomEvent ? P : never;

export type UnwrapTimelineEventsDetail<
  Key extends keyof ApiEvent<TEvent>,
  TEvent extends TimelineEvent = TimelineEvent,
  U extends ApiEvent<TEvent>[Key] = ApiEvent<TEvent>[Key],
  P extends Parameters<U>[0] = Parameters<U>[0],
> = UnwrapTimelineEvents<Key, TEvent, U, P>["detail"];
