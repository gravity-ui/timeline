import { TimeLineConfig, TimelineEvent, TimelineMarker } from "../../types";
import { baseTimelineConfig } from "../configs/events";
import { defaultViewConfig } from "../../constants/options";

export const config: TimeLineConfig<TimelineEvent, TimelineMarker> = {
  settings: {
    start: baseTimelineConfig.settings.start,
    end: baseTimelineConfig.settings.end,
    axes: baseTimelineConfig.settings.axes,
    events: baseTimelineConfig.settings.events,
  },
  viewConfiguration: defaultViewConfig,
};
