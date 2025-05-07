import React, { FC, useEffect, useMemo, useRef } from "react";
import { Timeline } from "../Timeline";
// import { yaTimelineConfig } from "../config";

type Props = {
  className?: string;
};

export const TimelineCanvas: FC<Props> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const timeline = useMemo(() => {
    return new Timeline({
      start: 1739537126347,
      end: 1739537186347,
      modules: {
        ruler: true,
      },
    });
  }, []);

  useEffect(() => {
    timeline.init(canvasRef.current);
  }, [timeline]);

  return (
    <div
      style={{
        display: "block",
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      1
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
      2
    </div>
  );
};
