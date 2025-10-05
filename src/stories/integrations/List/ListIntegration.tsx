import React, { FC } from "react";
import { GravityWrap } from "../GravityWrap";
import { TimelineCanvas, useTimeline } from "../../../react-components";
import {
  TimeLineConfig,
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
} from "../../../types";
import { commonConfig } from "../../configs/common";
import { defaultViewConfig } from "../../../constants/options";
import { EventsList } from "./EventsList";
import "./ListIntegration.scss";
import cn from "bem-cn-lite";

const block = cn("list-integration");

const config: TimeLineConfig<TimelineEvent, TimelineMarker, TimelineSection> = {
  settings: {
    ...commonConfig,
    axes: [
      {
        id: "main",
        tracksCount: 100,
        top: 0,
        height: 20,
      },
    ],
    events: Array.from({ length: 100 }).map((_, i) => {
      const diff = 100 * i + Math.random() * 100;
      return {
        from: commonConfig.start + diff,
        to: commonConfig.end - diff,
        id: `event_${i}`,
        axisId: "main",
        trackIndex: i,
        color: i % 2 ? "rgb(161, 193, 129)" : "rgb(254, 127, 45)",
      };
    }),
    sections: [
      {
        id: "morning-shift",
        from: commonConfig.start,
        to: commonConfig.start + (commonConfig.end - commonConfig.start) * 0.33,
        color: "rgba(255, 235, 59, 0.15)", // Light yellow
        hoverColor: "rgba(255, 235, 59, 0.25)",
      },
      {
        id: "afternoon-shift",
        from:
          commonConfig.start + (commonConfig.end - commonConfig.start) * 0.33,
        to: commonConfig.start + (commonConfig.end - commonConfig.start) * 0.66,
        color: "rgba(33, 150, 243, 0.15)", // Light blue
        hoverColor: "rgba(33, 150, 243, 0.25)",
      },
      {
        id: "evening-shift",
        from:
          commonConfig.start + (commonConfig.end - commonConfig.start) * 0.66,
        // Extends to end
        color: "rgba(156, 39, 176, 0.15)", // Light purple
        hoverColor: "rgba(156, 39, 176, 0.25)",
      },
    ],
  },
  viewConfiguration: { ...defaultViewConfig, hideRuler: true },
};

const data = config.settings.events.map((event) => event.id);

export const ListIntegration: FC = () => {
  const { timeline } = useTimeline(config);

  return (
    <GravityWrap>
      <div className={block()}>
        <EventsList items={data} itemHeight={25} timeline={timeline} />
        <TimelineCanvas timeline={timeline} />
      </div>
    </GravityWrap>
  );
};
