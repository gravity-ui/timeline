import React, { FC } from "react";
import { TimelineCanvas, useTimeline } from "../../../react-components";
import { TimelineEvent } from "../../../types";
import { baseTimelineConfig } from "../../configs/events";
import { TimelineRuler } from "./TimelineRuler";
import { config } from "../config";
import { GravityWrap } from "../GravityWrap";

export const RangeSelection: FC = () => {
  const { timeline } = useTimeline<TimelineEvent>(config);

  return (
    <GravityWrap>
      <TimelineRuler
        timeline={timeline}
        initialInterval={{
          start: baseTimelineConfig.settings.start,
          end: baseTimelineConfig.settings.end,
        }}
      />
      <TimelineCanvas timeline={timeline} />
    </GravityWrap>
  );
};
