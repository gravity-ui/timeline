import { TimeLineConfig, TimelineEvent, TimelineMarker } from "../../types";
import { MarkerDeselectionMode } from "../../enums";

export const commonConfig: Pick<
  TimeLineConfig<TimelineEvent, TimelineMarker>["settings"],
  "start" | "end" | "axes" | "selectedEventIds" | "markerDeselectionMode"
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
  markerDeselectionMode: MarkerDeselectionMode.ON_CLICK_ANYWHERE,
};
