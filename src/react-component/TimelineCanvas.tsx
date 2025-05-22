import React, { FC, useEffect, useMemo, useRef } from "react";
import { Timeline } from "../Timeline";

type Props = {
  className?: string;
};

export const TimelineCanvas: FC<Props> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const timeline = useMemo(() => {
    return new Timeline({
      settings: {
        start: 1739537126347,
        end: 1739537186347,
        axes: [
          {
            id: "1",
            tracksCount: 10,
            top: 0,
            height: 40,
          },
        ],
        events: [
          {
            id: "test1",
            from: 1739537146347,
            axisId: "1",
            trackIndex: 1,
            color: "#60c2e3",
            selectedColor: "#77dc59",
          },
          {
            id: "test2",
            from: 1739537146347,
            to: 1739537166347,
            axisId: "1",
            trackIndex: 3,
          },
        ],
        onClick: (events) => {
          console.info("events:", events);
        },
        onSelectChange: (events) => {
          console.info("selected events:", events);
        },
        onContextMenu: (events) => {
          console.info("context event:", events);
        },
        onHover: (data) => {
          console.info("hover:", data);
        },
        onLeave: (data) => {
          console.info("leave", data);
        },
      },
    });
  }, []);

  useEffect(() => {
    timeline.init(canvasRef.current);
    timeline.api.setSelectedEvents(["test2"]);
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
    </div>
  );
};
