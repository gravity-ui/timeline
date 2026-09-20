import React from "react";
import { Button } from "@gravity-ui/uikit";
import { TimelineEvent } from "../../../types";
import { TimelineCanvas, useTimeline } from "../../../react-components";
import { EventPopup } from "../../../react-uikit";
import { GravityWrap } from "../GravityWrap";

const START = 1739537100000;
const SECOND = 1000;
type NamedEvent = TimelineEvent & { name: string };

const makeEvent = (
  id: string,
  from: number,
  to: number,
  trackIndex: number,
  color: string,
): NamedEvent => ({
  id,
  name: `Event ${id}`,
  axisId: "main",
  trackIndex,
  from: START + from * SECOND,
  to: START + to * SECOND,
  color: `var(--g-color-base-${color}-medium)`,
  hoverColor: `var(--g-color-base-${color}-heavy)`,
  cursor: "pointer",
});

const events = [
  makeEvent("A", 10, 60, 0, "positive"),
  makeEvent("B", 30, 75, 0, "warning"),
  makeEvent("C", 45, 90, 0, "info"),
  makeEvent("D", 10, 50, 1, "positive"),
  makeEvent("E", 50, 90, 1, "warning"),
];

export const OverlappingEventsPopup = () => {
  const { timeline } = useTimeline<NamedEvent>({
    settings: {
      start: START,
      end: START + 100 * SECOND,
      axes: [{ id: "main", tracksCount: 2, top: 0, height: 40 }],
      events,
    },
  });

  return (
    <GravityWrap>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: 12,
        }}
      >
        <div>
          Move slowly across event edges: the highlight and popup follow the
          same event. Row 1: A → B → C (C is on top). Row 2: D and E share an
          edge. Use the controls below to check zoom and vertical scrolling.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {events.map((event) => (
            <span
              key={event.id}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <span
                style={{ width: 12, height: 12, background: event.color }}
              />
              {event.name}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            onClick={() =>
              timeline.api.setRange(START + 25 * SECOND, START + 75 * SECOND)
            }
          >
            Zoom in
          </Button>
          <Button onClick={() => timeline.api.setCanvasScrollTop(20)}>
            Scroll down
          </Button>
          <Button
            onClick={() => {
              timeline.api.setRange(START, START + 100 * SECOND);
              timeline.api.setCanvasScrollTop(0);
            }}
          >
            Reset view
          </Button>
        </div>
        <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
          <TimelineCanvas timeline={timeline} />
          <EventPopup
            timeline={timeline}
            content={(event) => (
              <div style={{ padding: 12 }}>
                <div>{event.name}</div>
                <div>ID: {event.id}</div>
              </div>
            )}
          />
        </div>
      </div>
    </GravityWrap>
  );
};
