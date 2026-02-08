import React, { FC, useEffect, useRef, useState } from "react";
import { TimelineCanvas, useTimeline } from "../../../react-components";
import { TimelineEvent } from "../../../types";
import { config } from "../config";
import { GravityWrap } from "../GravityWrap";
import { TimelineDragHandler } from "./TimelineDragHandler";

export const DragHandlerDemo: FC = () => {
  const { timeline } = useTimeline<TimelineEvent>(config);
  const dragHandlerRef = useRef<TimelineDragHandler | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentInterval, setCurrentInterval] = useState<{
    start: number;
    end: number;
  } | null>(null);

  useEffect(() => {
    if (!timeline) {
      return undefined;
    }

    const handlePan = (start: number, end: number) => {
      timeline.api.setRange(start, end);
      setCurrentInterval({ start, end });
    };

    const handleDragStart = () => {
      setIsDragging(true);
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      const { start, end } = timeline.api.getInterval();
      setCurrentInterval({ start, end });
    };

    dragHandlerRef.current = new TimelineDragHandler(
      timeline,
      undefined,
      handlePan,
      handleDragStart,
      handleDragEnd,
    );

    const { start, end } = timeline.api.getInterval();
    setCurrentInterval({ start, end });

    return () => {
      dragHandlerRef.current?.destroy();
      dragHandlerRef.current = null;
    };
  }, [timeline]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <GravityWrap>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div
          style={{
            padding: "8px 16px",
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            gap: "16px",
            alignItems: "center",
            fontSize: "14px",
          }}
        >
          <span
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              backgroundColor: isDragging ? "#ffeb3b" : "#e8f5e9",
              color: isDragging ? "#f57f17" : "#2e7d32",
              fontWeight: 500,
            }}
          >
            {isDragging ? "Dragging..." : "Ready"}
          </span>
          {currentInterval && (
            <span style={{ color: "#666" }}>
              Interval: {formatTime(currentInterval.start)} -{" "}
              {formatTime(currentInterval.end)}
            </span>
          )}
        </div>
        <div
          style={{
            padding: "8px 16px",
            backgroundColor: "#f5f5f5",
            fontSize: "13px",
            color: "#666",
          }}
        >
          Drag the timeline canvas to pan horizontally. Works with both mouse
          and touch.
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <TimelineCanvas timeline={timeline} />
        </div>
      </div>
    </GravityWrap>
  );
};
