import React, { FC, useState } from "react";
import { ThemeProvider } from "@gravity-ui/uikit";
import { RangeDateSelection, RangeValue } from "@gravity-ui/date-components";
import "@gravity-ui/uikit/styles/fonts.css";
import "@gravity-ui/uikit/styles/styles.css";
import {
  TimelineCanvas,
  useTimeline,
  useTimelineEvent,
} from "../../react-components";
import { defaultViewConfig } from "../../constants/options";
import { TimelineEvent } from "../../types";
import { DateTime, dateTimeParse } from "@gravity-ui/date-utils";
import { baseTimelineConfig } from "../configs/events";

type Interval = { start: number; end: number };

export const RangeSelection: FC = () => {
  const [interval, setInterval] = useState<Interval>({
    start: baseTimelineConfig.settings.start,
    end: baseTimelineConfig.settings.end,
  });

  const { timeline } = useTimeline<TimelineEvent>({
    settings: {
      ...interval,
      axes: baseTimelineConfig.settings.axes,
      events: baseTimelineConfig.settings.events,
    },
    viewConfiguration: defaultViewConfig,
  });

  useTimelineEvent(timeline, "on-camera-change", ({ from, to }) => {
    setInterval({
      start: from,
      end: to,
    });
  });

  const handleRangeUpdate = (value: RangeValue<DateTime>) => {
    setInterval({
      start: value.start.valueOf(),
      end: value.end.valueOf(),
    });
  };

  return (
    <ThemeProvider theme="light">
      <RangeDateSelection
        value={{
          start: dateTimeParse(interval.start),
          end: dateTimeParse(interval.end),
        }}
        onUpdate={handleRangeUpdate}
      />
      <TimelineCanvas timeline={timeline} />
    </ThemeProvider>
  );
};
