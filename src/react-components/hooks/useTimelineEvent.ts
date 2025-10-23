import { useCallback, useLayoutEffect } from "react";
import {
  ApiEvent,
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
  UnwrapTimelineEvents,
  UnwrapTimelineEventsDetail,
} from "../../types";
import { Timeline } from "../../Timeline";

export function useTimelineEvent<
  Event extends keyof ApiEvent,
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
>(
  timeline: Timeline<TEvent, TMarker, TSection> | null,
  event: Event,
  cb: (
    data: UnwrapTimelineEventsDetail<Event, TEvent, TMarker, TSection>,
    event: UnwrapTimelineEvents<Event, TEvent, TMarker, TSection>,
  ) => void,
) {
  const onEvent = useCallback(
    (e: UnwrapTimelineEvents<Event, TEvent, TMarker, TSection>) => {
      cb(e.detail, e);
    },
    [cb],
  );

  useLayoutEffect(() => {
    if (!timeline) return;
    timeline.on(event, onEvent);
  }, [timeline, event, onEvent]);
}
