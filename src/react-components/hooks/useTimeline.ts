import { useMemo } from "react";
import { Timeline } from "../../Timeline";
import {
  TimeLineConfig,
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
} from "../../types";

export const useTimeline = <
  TEvent extends TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
>(
  config: TimeLineConfig<TEvent, TMarker, TSection>,
) => {
  const timeline = useMemo(() => {
    return new Timeline(config);
  }, [config]);

  return {
    timeline,
    api: timeline.api,
    start: (canvas: HTMLCanvasElement) => {
      timeline.init(canvas);
    },
    stop: () => {
      timeline.destroy();
    },
  };
};
