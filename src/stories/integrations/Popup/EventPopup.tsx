import React, { ReactNode, useCallback, useState } from "react";
import { Timeline } from "../../../Timeline";
import { HoverEvent, TimelineEvent } from "../../../types";
import { Popup } from "@gravity-ui/uikit";
import { useTimelineEvent } from "../../../react-components";

type Position = { x0: number; x1: number; y0: number; h: number };

type Props<TEvent extends TimelineEvent> = {
  timeline: Timeline<TimelineEvent>;
  content: (event: TEvent) => ReactNode;
};

export const EventPopup = <TEvent extends TimelineEvent>({
  timeline,
  content,
}: Props<TEvent>) => {
  const [boxElement, setBoxElement] = useState(null);
  const [eventData, setEventData] = useState<
    { event: TEvent; position: Position } | undefined
  >(undefined);

  const handleEventsHover = useCallback(
    ({ events }: HoverEvent<TEvent>) => {
      if (!events.length) {
        setEventData(undefined);
        return;
      }

      const event = events[0];
      const position = timeline.api.getEventPosition(event);
      setEventData({ event, position });
    },
    [timeline],
  );

  const handleEventLeave = useCallback(() => {
    setEventData(undefined);
  }, []);

  useTimelineEvent(timeline, "on-hover", handleEventsHover);
  useTimelineEvent(timeline, "on-leave", handleEventLeave);

  if (!eventData) return null;

  return (
    <>
      <div
        ref={setBoxElement}
        style={{
          position: "absolute",
          top: eventData.position.y0 - eventData.position.h / 2,
          left: eventData.position.x0,
          width: eventData.position.x1 - eventData.position.x0,
          height: eventData.position.h,
          zIndex: 2,
          pointerEvents: "none",
        }}
      ></div>
      <Popup key={eventData.event.id} anchorElement={boxElement} open>
        {content(eventData.event)}
      </Popup>
    </>
  );
};
