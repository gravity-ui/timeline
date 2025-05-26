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

export type ApiEvent = {
  "on-click": (
    event: CustomEvent<{ events: TimelineEvent[] } & BaseEventData>,
  ) => void;
  "on-context-click": (
    event: CustomEvent<{ event?: TimelineEvent } & BaseEventData>,
  ) => void;
  "on-select-change": (event: CustomEvent<{ events: TimelineEvent[] }>) => void;
  "on-hover": (
    event: CustomEvent<{ event: TimelineEvent } & BaseEventData>,
  ) => void;
  "on-leave": (event: CustomEvent<{ event: TimelineEvent }>) => void;
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
