import React, { useEffect } from "react";
import { useTimeline } from "../react-component/hooks/useTimeline";
import { useTimelineEvent } from "../react-component/hooks/useTimelineEvent";
import { action } from "@storybook/addon-actions";
import { TimelineCanvas } from "../react-component/TimelineCanvas";
import { TimelineSettings, ViewConfiguration } from "../types";

type ViewConfigurationControls = {
  [K in keyof ViewConfiguration as `viewConfiguration.${K}`]: ViewConfiguration[K];
};

type SettingsControls = {
  [K in keyof TimelineSettings as `settings.${K}`]: TimelineSettings[K];
};

type TimelineStoryProps = SettingsControls & ViewConfigurationControls;

export const StoryWrapper: React.FC<TimelineStoryProps> = (props) => {
  // Reconstruct settings object from flattened props
  const settings = Object.entries(props).reduce((acc, [key, value]) => {
    if (key.startsWith("settings.")) {
      const propName = key.replace("settings.", "");
      acc[propName] = value;
    }
    return acc;
  }, {} as TimelineSettings);

  // Reconstruct viewConfiguration object from flattened props
  const viewConfiguration = Object.entries(props).reduce(
    (acc, [key, value]) => {
      if (key.startsWith("viewConfiguration.")) {
        const propName = key.replace("viewConfiguration.", "");
        acc[propName] = value;
      }
      return acc;
    },
    {} as ViewConfiguration,
  );

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
