import React, { ReactNode, useCallback, useState } from "react";
import {
  HoverEvent,
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
} from "../../../types";
import { Timeline } from "../../../Timeline";
import { useTimelineEvent } from "../../../react-components";

type Position = { x0: number; x1: number; y0: number; h: number };

type Props<
  TEvent extends TimelineEvent,
  TMarker extends TimelineMarker,
  TSection extends TimelineSection,
> = {
  timeline: Timeline<TEvent, TMarker, TSection>;
  content: (section: TSection) => ReactNode;
};

export const SectionPopup = <
  TEvent extends TimelineEvent,
  TMarker extends TimelineMarker,
  TSection extends TimelineSection,
>({
  timeline,
  content,
}: Props<TEvent, TMarker, TSection>) => {
  const [sectionData, setSectionData] = useState<
    { section: TSection; position: Position } | undefined
  >(undefined);

  const handleSectionsHover = useCallback(
    ({ sections, events }: HoverEvent<TEvent, TMarker, TSection>) => {
      if (!sections.length || events.length) {
        setSectionData(undefined);
        return;
      }

      const section = sections[0];
      const position = timeline.api.getSectionPosition(section);
      setSectionData({ section, position });
    },
    [timeline],
  );

  const handleEventLeave = useCallback(() => {
    setSectionData(undefined);
  }, []);

  useTimelineEvent(timeline, "on-hover", handleSectionsHover);
  useTimelineEvent(timeline, "on-leave", handleEventLeave);

  if (!sectionData) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: sectionData.position.y0,
        left: sectionData.position.x0,
        width: sectionData.position.x1 - sectionData.position.x0,
        height: sectionData.position.h - sectionData.position.y0,
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          padding: "10px",
          background: "white",
        }}
      >
        {content(sectionData.section)}
      </div>
    </div>
  );
};
