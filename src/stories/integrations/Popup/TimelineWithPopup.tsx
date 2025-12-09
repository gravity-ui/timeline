import React, { FC } from "react";
import "@gravity-ui/uikit/styles/fonts.css";
import "@gravity-ui/uikit/styles/styles.css";
import { TimelineEvent } from "../../../types";
import { TimelineCanvas, useTimeline } from "../../../react-components";
import { EventPopup } from "./EventPopup";
import { config } from "../config";
import { GravityWrap } from "../GravityWrap";
import { SectionPopup } from "./SectionPopup";

export const TimelineWithPopup: FC = () => {
  const { timeline } = useTimeline<TimelineEvent>({
    settings: {
      ...config.settings,
      sections: [
        {
          id: "test1",
          from: 1739537160000,
          to: 1739537186347,
          color: "rgba(33, 150, 243, 0.2)", // Blue - development
          hoverColor: "rgba(33, 150, 243, 0.3)",
        },
      ],
    },
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
        <SectionPopup
          timeline={timeline}
          content={() => {
            return <div>section popup</div>;
          }}
        />
      </div>
    </GravityWrap>
  );
};
