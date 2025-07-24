import { useMemo } from "react";
import { Timeline } from "../../Timeline";
import { TimeLineConfig } from "../../types/configuration";

export const useTimeline = (config: TimeLineConfig) => {
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
