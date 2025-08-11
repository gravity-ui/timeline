import React, { FC, useState } from "react";
import { Timeline } from "../../../Timeline";
import { TimelineEvent, TimelineMarker } from "../../../types";
import { DateTime, dateTimeParse } from "@gravity-ui/date-utils";
import { RangeDateSelection, RangeValue } from "@gravity-ui/date-components";
import { useTimelineEvent } from "../../../react-components";

type Interval = { start: number; end: number };

type Props<
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
> = {
  timeline: Timeline<TEvent, TMarker>;
  initialInterval: Interval;
};

export const TimelineRuler: FC<Props> = ({ timeline, initialInterval }) => {
  const [interval, setInterval] = useState<Interval>(initialInterval);

  const handleRangeUpdate = (value: RangeValue<DateTime>) => {
    timeline.api.setRange(value.start.valueOf(), value.end.valueOf());
  };

  useTimelineEvent(timeline, "on-camera-change", ({ from, to }) => {
    setInterval({
      start: from,
      end: to,
    });
  });

  return (
    <RangeDateSelection
      value={{
        start: dateTimeParse(interval.start),
        end: dateTimeParse(interval.end),
      }}
      onUpdate={handleRangeUpdate}
    />
  );
};
