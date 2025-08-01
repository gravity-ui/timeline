import React, { FC } from "react";
import { ThemeProvider } from "@gravity-ui/uikit";
import "@gravity-ui/uikit/styles/fonts.css";
import "@gravity-ui/uikit/styles/styles.css";
import { TimelineEvent } from "../../../types";
import { TimelineCanvas, useTimeline } from "../../../react-components";
import { EventPopup } from "./EventPopup";
import { config } from "../config";

export const TimelineWithPopup: FC = () => {
  const { timeline } = useTimeline<TimelineEvent>({
    ...config,
    viewConfiguration: {
      ...config.viewConfiguration,
      // hideRuler: true,
    },
  });

  return (
    <ThemeProvider theme="light">
      <div style={{ position: "relative", height: "100%", width: "100%" }}>
        <TimelineCanvas timeline={timeline} />
        <EventPopup
          timeline={timeline}
          content={(event) => {
            return <div>ID: {event.id}</div>;
          }}
        />
      </div>
    </ThemeProvider>
  );
};
