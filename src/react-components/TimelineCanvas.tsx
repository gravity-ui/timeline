import React, { useEffect, useRef } from "react";
import { Timeline } from "../Timeline";
import { TimelineEvent, TimelineMarker, TimelineSection } from "../types";

type Props<
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
> = {
  className?: string;
  timeline: Timeline<TEvent, TMarker, TSection>;
};

export const TimelineCanvas = <
  TEvent extends TimelineEvent,
  TMarker extends TimelineMarker,
  TSection extends TimelineSection,
>({
  timeline,
  className,
}: Props<TEvent, TMarker, TSection>) => {
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
