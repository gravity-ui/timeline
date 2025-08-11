import React, { FC } from "react";
import { GravityWrap } from "../GravityWrap";
import { TimelineCanvas, useTimeline } from "../../../react-components";
import { TimeLineConfig, TimelineEvent, TimelineMarker } from "../../../types";
import { commonConfig } from "../../configs/common";
import { defaultViewConfig } from "../../../constants/options";
import { EventsList } from "./EventsList";
import "./ListIntegration.scss";
import cn from "bem-cn-lite";

const block = cn("list-integration");

const config: TimeLineConfig<TimelineEvent, TimelineMarker> = {
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
