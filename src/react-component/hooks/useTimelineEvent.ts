import { useCallback, useLayoutEffect } from "react";
import {
  ApiEvent,
  UnwrapTimelineEvents,
  UnwrapTimelineEventsDetail,
} from "../../types";
import { Timeline } from "../../Timeline";

export function useTimelineEvent<Event extends keyof ApiEvent>(
  timeline: Timeline | null,
  event: Event,
  cb: (
    data: UnwrapTimelineEventsDetail<Event>,
    event: UnwrapTimelineEvents<Event>,
  ) => void,
) {
  const onEvent = useCallback(
    (e: UnwrapTimelineEvents<Event>) => {
      cb(e.detail, e);
    },
    [cb],
  );

  useLayoutEffect(() => {
    if (!timeline) return;
    timeline.on(event, onEvent);
  }, [timeline, event, onEvent]);
}
