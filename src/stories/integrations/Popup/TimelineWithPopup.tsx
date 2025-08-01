import React, { FC } from "react";
import "@gravity-ui/uikit/styles/fonts.css";
import "@gravity-ui/uikit/styles/styles.css";
import { TimelineEvent } from "../../../types";
import { TimelineCanvas, useTimeline } from "../../../react-components";
import { EventPopup } from "./EventPopup";
import { config } from "../config";
import { GravityWrap } from "../GravityWrap";

export const TimelineWithPopup: FC = () => {
  const { timeline } = useTimeline<TimelineEvent>({
    ...config,
    viewConfiguration: {
      ...config.viewConfiguration,
    },
  });

  return (
    <GravityWrap>
      <div style={{ position: "relative", height: "100%", width: "100%" }}>
        <TimelineCanvas timeline={timeline} />
        <EventPopup
          timeline={timeline}
          content={(event) => {
            return <div>ID: {event.id}</div>;
          }}
        />
      </div>
    </GravityWrap>
  );
};
