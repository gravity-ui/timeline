import { TimeLineConfig, TimelineEvent, TimelineMarker } from "../../types";
import { MyEvent, MyEventRenderer } from "../MyEventRenderer";
import { commonConfig } from "./common";

export const baseTimelineConfig: TimeLineConfig<TimelineEvent, TimelineMarker> =
  {
    settings: {
      ...commonConfig,
      events: [
        {
          id: "test2",
          from: 1739537144007,
          to: 1739537166347,
          axisId: "main",
          trackIndex: 1,
          color: "rgb(161, 193, 129)",
        },
        {
          id: "test3",
          from: 1739537126347,
          to: 1739537150000,
          axisId: "main",
          trackIndex: 2,
          color: "rgb(254, 127, 45)",
        },
        {
          id: "test4",
          from: 1739537146347,
          to: 1739537160000,
          axisId: "main",
          trackIndex: 2,
          color: "rgb(45,181,254)",
        },
        {
          id: "test5",
          from: 1739537150000,
          to: 1739537170000,
          axisId: "main",
          trackIndex: 3,
          color: "rgb(87, 156, 135)",
        },
        {
          id: "test6",
          from: 1739537170000,
          to: 1739537186347,
          axisId: "main",
          trackIndex: 4,
          color: "rgb(11, 180, 193)",
        },
      ],
    },
  };

export const endlessTimelineConfig: TimeLineConfig<
  TimelineEvent,
  TimelineMarker
> = {
  settings: {
    ...commonConfig,
    events: [
      {
        id: "test2",
        from: 1739537144007,
        axisId: "main",
        trackIndex: 1,
        color: "rgb(161, 193, 129)",
      },
      {
        id: "test5",
        from: 1739537170000,
        axisId: "main",
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
    axisId: "main",
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
    renderer: new MyEventRenderer(),
  },
];

export const customRendererConfig: TimeLineConfig<MyEvent, TimelineMarker> = {
  settings: {
    ...commonConfig,
    events: customEvents,
  },
};
