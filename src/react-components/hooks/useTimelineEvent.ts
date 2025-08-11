import { useCallback, useLayoutEffect } from "react";
import {
  ApiEvent,
  TimelineEvent,
  TimelineMarker,
  UnwrapTimelineEvents,
  UnwrapTimelineEventsDetail,
} from "../../types";
import { Timeline } from "../../Timeline";

export function useTimelineEvent<
  Event extends keyof ApiEvent,
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
>(
  timeline: Timeline<TEvent, TMarker> | null,
  event: Event,
  cb: (
    data: UnwrapTimelineEventsDetail<Event, TEvent>,
    event: UnwrapTimelineEvents<Event, TEvent>,
  ) => void,
) {
  const onEvent = useCallback(
    (e: UnwrapTimelineEvents<Event, TEvent>) => {
      cb(e.detail, e);
    },
    [cb],
  );

  useLayoutEffect(() => {
    if (!timeline) return;
    timeline.on(event, onEvent);
  }, [timeline, event, onEvent]);
}
