import React from "react";
import { TimelineCanvas } from "../react-component/TimelineCanvas";
import { TimeLineConfig } from "../types";
import { useTimeline } from "../react-component/hooks/useTimeline";

const timelineConfig: TimeLineConfig = {
  settings: {
    start: 1739537126347,
    end: 1739537186347,
    axes: [
      {
        id: "1",
        tracksCount: 5,
        top: 0,
        height: 40,
      },
    ],
    events: [
      {
        id: "test1",
        from: 1739537146347,
        axisId: "1",
        trackIndex: 0,
        color: "rgb(252, 202, 70)",
        // selectedColor: "rgb(252, 202, 70)",
      },
      {
        id: "test2",
        from: 1739537144007,
        to: 1739537166347,
        axisId: "1",
        trackIndex: 1,
        color: "rgb(161, 193, 129)",
      },
      {
        id: "test3",
        from: 1739537126347,
        to: 1739537150000,
        axisId: "1",
        trackIndex: 2,
        color: "rgb(254, 127, 45)",
      },
      {
        id: "test4",
        from: 1739537150000,
        to: 1739537170000,
        axisId: "1",
        trackIndex: 3,
        color: "rgb(87, 156, 135)",
      },
      {
        id: "test5",
        from: 1739537170000,
        to: 1739537186347,
        axisId: "1",
        trackIndex: 4,
        color: "rgb(11, 180, 193)",
      },
    ],
  },
};

export default {
  title: "YaTimeline/Events",
  component: TimelineCanvas,
  argTypes: {
    start: { control: "number" },
    end: { control: "number" },
    canvasScrollTop: { control: "number" },
    isZoomAllowed: { control: "boolean" },
    className: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100%", height: "400px" }}>
        <Story />
      </div>
    ),
  ],
};

// Basic story with events
export const Basic = () => {
  const { timeline } = useTimeline(timelineConfig);

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
