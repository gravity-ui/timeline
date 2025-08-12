import { TimeLineConfig, TimelineEvent, TimelineMarker } from "../../types";
import { commonConfig } from "./common";
import { MyMarker, MyMarkerRenderer } from "../MyMarkerRenderer";

const events: TimeLineConfig<
  TimelineEvent,
  TimelineMarker
>["settings"]["events"] = [
  {
    id: "test4",
    from: 1739537150000,
    to: 1739537170000,
    axisId: "main",
    trackIndex: 3,
    color: "rgb(87, 156, 135)",
  },
];

const colors: Pick<MyMarker, "hoverColor" | "activeColor"> = {
  hoverColor: "rgb(11, 180, 193)",
  activeColor: "rgb(255,198,2)",
};

export const markersBaseConfig: TimeLineConfig<TimelineEvent, TimelineMarker> =
  {
    settings: {
      ...commonConfig,
      events,
      markers: [
        {
          time: 1739537150000,
          color: "rgb(254, 127, 45)",
          ...colors,
          lineWidth: 1,
        },
        {
          time: 1739537170000,
          color: "rgb(11, 180, 193)",
          ...colors,
          lineWidth: 3,
        },
      ],
    },
  };

export const collapsedBaseConfig: TimeLineConfig<
  TimelineEvent,
  TimelineMarker
> = {
  settings: {
    ...commonConfig,
    events,
    markers: [
      {
        time: 1739537150100,
        color: "rgb(254, 127, 45)",
        ...colors,
        lineWidth: 1,
      },
      {
        time: 1739537150200,
        color: "rgb(11, 180, 193)",
        ...colors,
        lineWidth: 1,
      },
      {
        time: 1739537150300,
        color: "rgb(254, 127, 45)",
        ...colors,
        lineWidth: 1,
      },
      {
        time: 1739537150400,
        color: "rgb(255,198,2)",
        ...colors,
        lineWidth: 1,
      },
    ],
  },
};

export const markersWithLabelsConfig: TimeLineConfig<
  TimelineEvent,
  TimelineMarker
> = {
  settings: {
    ...commonConfig,
    events,
    markers: [
      {
        time: 1739537150000,
        color: "rgb(254, 127, 45)",
        ...colors,
        label: "Start Phase1",
      },
      {
        time: 1739537160000,
        color: "rgb(254, 127, 45)",
        ...colors,
        label: "Start Phase2",
      },
      {
        time: 1739537170000,
        color: "rgb(11, 180, 193)",
        ...colors,
        label: "End Phase",
      },
    ],
  },
};

const commonCustomConfig: Pick<
  MyMarker,
  "hoverColor" | "activeColor" | "labelColor" | "renderer"
> = {
  labelColor: "#333",
  hoverColor: "rgb(11, 180, 193)",
  activeColor: "rgb(254, 127, 45)",
  renderer: new MyMarkerRenderer(),
};

export const markersCustomRenderer: TimeLineConfig<TimelineEvent, MyMarker> = {
  settings: {
    ...commonConfig,
    events,
    markers: [
      {
        time: 1739537150000,
        lineWidth: 2,
        color: "rgb(161, 193, 129)",
        label: "test",
        ...commonCustomConfig,
      },
      {
        time: 1739537150600,
        color: "rgb(161, 193, 129)",
        lineWidth: 1,
        ...commonCustomConfig,
      },
      {
        time: 1739537150700,
        color: "rgb(11, 180, 193)",
        lineWidth: 1,
        ...commonCustomConfig,
      },
      {
        time: 1739537150800,
        color: "rgb(254, 127, 45)",
        lineWidth: 1,
        ...commonCustomConfig,
      },
      {
        time: 1739537150900,
        color: "rgb(255,198,2)",
        lineWidth: 1,
        ...commonCustomConfig,
      },
    ],
  },
};
