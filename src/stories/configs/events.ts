import { TimeLineConfig } from "../../types";
import { MyEvent, MyRenderer } from "../MyRenderer";
import { commonConfig } from "./common";

export const baseTimelineConfig: TimeLineConfig = {
  settings: {
    ...commonConfig,
    events: [
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

export const endlessTimelineConfig: TimeLineConfig = {
  settings: {
    ...commonConfig,
    events: [
      {
        id: "test2",
        from: 1739537144007,
        axisId: "1",
        trackIndex: 1,
        color: "rgb(161, 193, 129)",
      },
      {
        id: "test5",
        from: 1739537170000,
        axisId: "1",
        trackIndex: 4,
        color: "rgb(11, 180, 193)",
      },
    ],
  },
};

const customEvents: MyEvent[] = [
  {
    id: "test2",
    from: 1739537144007,
    to: 1739537166347,
    axisId: "1",
    trackIndex: 1,
    phases: [
      {
        percent: 20,
        color: "rgb(254, 127, 45)",
      },
      {
        percent: 50,
        color: "rgb(255,198,2)",
      },
      {
        percent: 30,
        color: "rgb(161, 193, 129)",
      },
    ],
    borderColor: "#243",
    selectedBorderColor: "#f60630",
    renderer: new MyRenderer(),
  },
];

export const customRendererConfig: TimeLineConfig = {
  settings: {
    ...commonConfig,
    events: customEvents,
  },
};
