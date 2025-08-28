import React, { useEffect, useRef } from "react";
import { Timeline } from "../Timeline";
import { TimelineEvent, TimelineMarker } from "../types";

type Props<
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
> = {
  className?: string;
  timeline: Timeline<TEvent, TMarker>;
};

export const TimelineCanvas = <
  TEvent extends TimelineEvent,
  TMarker extends TimelineMarker,
>({
  timeline,
  className,
}: Props<TEvent, TMarker>) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    timeline.init(canvasRef.current);

    return () => {
      timeline.destroy();
    };
  }, [timeline]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      tabIndex={0}
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
      }}
    />
  );
};
