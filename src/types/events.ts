import { AbstractEventRenderer } from "../components/Events";

export type TimelineEvent = {
  id: string;
  from: number;
  to?: number;
  axisId: string;
  trackIndex: number;
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

export type ClickEvent = { events: TimelineEvent[] } & BaseEventData;
export type SelectEvent = { events: TimelineEvent[] } & BaseEventData;
export type ContextEvent = { event?: TimelineEvent } & BaseEventData;
export type HoverEvent = { event: TimelineEvent } & BaseEventData;
export type LeaveEvent = { event: TimelineEvent };
export type CameraEvent = { from: number; to: number };

export type ApiEvent = {
  "on-click": (event: CustomEvent<ClickEvent>) => void;
  "on-context-click": (event: CustomEvent<ContextEvent>) => void;
  "on-select-change": (event: CustomEvent<SelectEvent>) => void;
  "on-hover": (event: CustomEvent<HoverEvent>) => void;
  "on-leave": (event: CustomEvent<LeaveEvent>) => void;
  "on-camera-change": (event: CustomEvent<CameraEvent>) => void;
};

export type UnwrapTimelineEvents<
  Key extends keyof ApiEvent,
  T extends ApiEvent[Key] = ApiEvent[Key],
  P extends Parameters<T>[0] = Parameters<T>[0],
> = P extends CustomEvent ? P : never;

export type UnwrapTimelineEventsDetail<
  Key extends keyof ApiEvent,
  T extends ApiEvent[Key] = ApiEvent[Key],
  P extends Parameters<T>[0] = Parameters<T>[0],
> = UnwrapTimelineEvents<Key, T, P>["detail"];
