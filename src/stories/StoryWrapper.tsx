import React, { useEffect } from "react";
import { useTimeline } from "../react-component/hooks/useTimeline";
import { useTimelineEvent } from "../react-component/hooks/useTimelineEvent";
import { action } from "@storybook/addon-actions";
import { TimelineCanvas } from "../react-component/TimelineCanvas";
import { TimeLineConfig } from "../types";

// Define the props that our story will control
type TimelineStoryProps = {
  settings: TimeLineConfig["settings"];
  viewConfiguration: TimeLineConfig["viewConfiguration"];
};

export const StoryWrapper: React.FC<TimelineStoryProps> = ({
  settings,
  viewConfiguration,
}) => {
  const { timeline } = useTimeline({ settings, viewConfiguration });

  useEffect(() => {
    return () => {
      if (timeline) {
        timeline.destroy();
      }
    };
  }, []);

  useTimelineEvent(timeline, "on-click", (data) => {
    action("on-click")(data);
  });

  useTimelineEvent(timeline, "on-context-click", (data) => {
    action("on-context-click")(data);
  });

  useTimelineEvent(timeline, "on-select-change", (data) => {
    action("on-select-change")(data);
  });

  useTimelineEvent(timeline, "on-hover", (data) => {
    action("on-hover")(data);
  });

  useTimelineEvent(timeline, "on-leave", (data) => {
    action("on-leave")(data);
  });

  return (
    <div
      style={{
        display: "block",
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <TimelineCanvas timeline={timeline} />
    </div>
  );
};
