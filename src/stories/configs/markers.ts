import { TimeLineConfig, TimelineEvent } from "../../types";
import { commonConfig } from "./common";

const events: TimeLineConfig<TimelineEvent>["settings"]["events"] = [
  {
    id: "test4",
    from: 1739537150000,
    to: 1739537170000,
    axisId: "main",
    trackIndex: 3,
    color: "rgb(87, 156, 135)",
  },
];

export const markersBaseConfig: TimeLineConfig<TimelineEvent> = {
  settings: {
    ...commonConfig,
    events,
    markers: [
      {
        time: 1739537150000,
        color: "rgb(254, 127, 45)",
        lineWidth: 1,
      },
      {
        time: 1739537170000,
        color: "rgb(11, 180, 193)",
        lineWidth: 3,
      },
    ],
  },
};

export const collapsedBaseConfig: TimeLineConfig<TimelineEvent> = {
  settings: {
    ...commonConfig,
    events,
    markers: [
      {
        time: 1739537150100,
        color: "rgb(254, 127, 45)",
        lineWidth: 1,
      },
      {
        time: 1739537150200,
        color: "rgb(11, 180, 193)",
        lineWidth: 1,
      },
      {
        time: 1739537150300,
        color: "rgb(254, 127, 45)",
        lineWidth: 1,
      },
      {
        time: 1739537150400,
        color: "rgb(255,198,2)",
        lineWidth: 1,
      },
    ],
  },
};

export const markersWithLabelsConfig: TimeLineConfig<TimelineEvent> = {
  settings: {
    ...commonConfig,
    events,
    markers: [
      {
        time: 1739537150000,
        color: "rgb(254, 127, 45)",
        label: "Start Phase1",
      },
      {
        time: 1739537160000,
        color: "rgb(254, 127, 45)",
        label: "Start Phase2",
      },
      {
        time: 1739537170000,
        color: "rgb(11, 180, 193)",
        label: "End Phase",
      },
    ],
  },
};
