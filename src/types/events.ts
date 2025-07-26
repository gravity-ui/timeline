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

export type ClickEvent = CustomEvent<
  { events: TimelineEvent[] } & BaseEventData
>;
export type SelectEvent = CustomEvent<
  { events: TimelineEvent[] } & BaseEventData
>;
export type ContextEvent = CustomEvent<
  { event?: TimelineEvent } & BaseEventData
>;
export type HoverEvent = CustomEvent<{ event: TimelineEvent } & BaseEventData>;
export type LeaveEvent = CustomEvent<{ event: TimelineEvent }>;

export type ApiEvent = {
  "on-click": (event: ClickEvent) => void;
  "on-context-click": (event: ContextEvent) => void;
  "on-select-change": (event: SelectEvent) => void;
  "on-hover": (event: HoverEvent) => void;
  "on-leave": (event: LeaveEvent) => void;
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
