import React, { useEffect, useRef } from "react";
import { Timeline } from "../Timeline";
import { TimelineEvent, TimelineMarker, TimelineSection } from "../types";

export type TimelineCanvasProps<
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
> = {
  className?: string;
  tabIndex?: number;
  timeline: Timeline<TEvent, TMarker, TSection>;
};

export const TimelineCanvas = <
  TEvent extends TimelineEvent,
  TMarker extends TimelineMarker,
  TSection extends TimelineSection,
>({
  timeline,
  className,
  tabIndex = 0,
}: TimelineCanvasProps<TEvent, TMarker, TSection>) => {
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
      tabIndex={tabIndex}
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
      }}
    />
  );
};
