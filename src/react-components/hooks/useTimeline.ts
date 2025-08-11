import { useMemo } from "react";
import { Timeline } from "../../Timeline";
import { TimeLineConfig } from "../../types/configuration";
import { TimelineEvent, TimelineMarker } from "../../types";

export const useTimeline = <
  TEvent extends TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
>(
  config: TimeLineConfig<TEvent, TMarker>,
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
