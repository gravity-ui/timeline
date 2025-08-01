import { TimeLineConfig, TimelineEvent } from "../../types";

export const commonConfig: Pick<
  TimeLineConfig<TimelineEvent>["settings"],
  "start" | "end" | "axes" | "selectedEventIds"
> = {
  start: 1739537126347,
  end: 1739537186347,
  axes: [
    {
      id: "main",
      tracksCount: 5,
      top: 0,
      height: 20,
    },
  ],
  selectedEventIds: [],
};
