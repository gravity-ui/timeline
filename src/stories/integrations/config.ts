import {
  TimeLineConfig,
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
} from "../../types";
import { baseTimelineConfig } from "../configs/events";
import { defaultViewConfig } from "../../constants/options";

export const config: TimeLineConfig<
  TimelineEvent,
  TimelineMarker,
  TimelineSection
> = {
  settings: {
    start: baseTimelineConfig.settings.start,
    end: baseTimelineConfig.settings.end,
    axes: baseTimelineConfig.settings.axes,
    events: baseTimelineConfig.settings.events,
  },
  viewConfiguration: defaultViewConfig,
};
