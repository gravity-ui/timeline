import React, { FC } from "react";
import { ThemeProvider } from "@gravity-ui/uikit";
import { TimelineCanvas, useTimeline } from "../../../react-components";
import { TimelineEvent } from "../../../types";
import { baseTimelineConfig } from "../../configs/events";
import { TimelineRuler } from "./TimelineRuler";
import "@gravity-ui/uikit/styles/fonts.css";
import "@gravity-ui/uikit/styles/styles.css";
import { config } from "../config";

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
