import { TimeLineConfig } from "../../types";
import { commonConfig } from "./common";

const events: TimeLineConfig["settings"]["events"] = [
  {
    id: "test4",
    from: 1739537150000,
    to: 1739537170000,
    axisId: "1",
    trackIndex: 3,
    color: "rgb(87, 156, 135)",
  },
];

export const markersBaseConfig: TimeLineConfig = {
  settings: {
    ...commonConfig,
    events,
    markers: [
      {
        time: 1739537150000,
        color: "rgb(254, 127, 45)",
        width: 1,
      },
      {
        time: 1739537170000,
        color: "rgb(11, 180, 193)",
        width: 3,
      },
    ],
  },
};

export const markersWithLabelsConfig: TimeLineConfig = {
  settings: {
    ...commonConfig,
    events,
    markers: [
      {
        time: 1739537150000,
        color: "rgb(254, 127, 45)",
        label: "Start Phase",
        labelTextColor: "#fff",
        labelBottom: "Phase 1",
        labelBottomTextColor: "#fff",
      },
      {
        time: 1739537160000,
        color: "rgb(254, 127, 45)",
        label: "Start Phase",
        labelTextColor: "#333",
        labelBackgroundColor: "rgb(255,198,2)",
        labelBottom: "Phase 1",
        labelBottomTextColor: "#fff",
        labelBottomBackgroundColor: "rgb(161, 193, 129)",
      },
      {
        time: 1739537170000,
        color: "rgb(11, 180, 193)",
        label: "End Phase",
        labelTextColor: "#fff",
        labelBackgroundColor: "rgb(11, 180, 193)",
        labelBottom: "Phase 2",
        labelBottomBackgroundColor: "rgb(11, 180, 193)",
        labelBottomTextColor: "#fff",
      },
    ],
  },
};
