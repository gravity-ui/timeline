import React, { FC, useEffect, useRef } from "react";
import { Timeline } from "../Timeline";
import { TimelineEvent } from "../types";

type Props<TEvent extends TimelineEvent = TimelineEvent> = {
  className?: string;
  timeline: Timeline<TEvent>;
};

export const TimelineCanvas: FC<Props> = ({ timeline, className }) => {
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
