import React, { FC } from "react";
import { ThemeProvider } from "@gravity-ui/uikit";
import "@gravity-ui/uikit/styles/fonts.css";
import "@gravity-ui/uikit/styles/styles.css";
import { TimelineCanvas, useTimeline } from "../../../react-components";
import { defaultViewConfig } from "../../../constants/options";
import { TimeLineConfig, TimelineEvent } from "../../../types";
import { baseTimelineConfig } from "../../configs/events";
import { TimelineRuler } from "./TimelineRuler";

const config: TimeLineConfig<TimelineEvent> = {
  settings: {
    start: baseTimelineConfig.settings.start,
    end: baseTimelineConfig.settings.end,
    axes: baseTimelineConfig.settings.axes,
    events: baseTimelineConfig.settings.events,
  },
  viewConfiguration: defaultViewConfig,
};

export const RangeSelection: FC = () => {
  const { timeline } = useTimeline<TimelineEvent>(config);

  return (
    <ThemeProvider theme="light">
      <TimelineRuler
        timeline={timeline}
        initialInterval={{
          start: baseTimelineConfig.settings.start,
          end: baseTimelineConfig.settings.end,
        }}
      />
      <TimelineCanvas timeline={timeline} />
    </ThemeProvider>
  );
};
