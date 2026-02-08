import React, { FC, useEffect } from "react";
import { TimelineCanvas, useTimeline } from "../../../react-components";
import { TimelineEvent } from "../../../types";
import { baseTimelineConfig } from "../../configs/events";
import { configWithHiddenRuler } from "../config";
import { GravityWrap } from "../GravityWrap";
import { RangeDateSelectionSyncedRuler } from "./RangeDateSelectionSyncedRuler";
import "./RangeSelection.scss";
import { TimelineRuler } from "./TimelineRuler";

export const RangeSelection: FC = () => {
  const { timeline } = useTimeline<TimelineEvent>(configWithHiddenRuler);

  useEffect(() => {
    if (!timeline) return undefined;

    const syncedRuler = new RangeDateSelectionSyncedRuler(timeline);
    timeline.api.addComponent("range-date-selection-synced-ruler", syncedRuler);
    timeline.api.rerender();

    return () => {
      timeline.api.removeComponent("range-date-selection-synced-ruler");
    };
  }, [timeline]);

  return (
    <GravityWrap>
      <div className="container">
        <TimelineRuler
          timeline={timeline}
          initialInterval={{
            start: baseTimelineConfig.settings.start,
            end: baseTimelineConfig.settings.end,
          }}
          className="rangeDatePicker"
        />
        <div className="timelineWrapper">
          <TimelineCanvas timeline={timeline} />
        </div>
      </div>
    </GravityWrap>
  );
};
