import React, { FC, useState } from "react";
import { Timeline } from "../../../Timeline";
import { TimelineEvent, TimelineMarker, TimelineSection } from "../../../types";
import { DateTime, dateTimeParse } from "@gravity-ui/date-utils";
import { RangeDateSelection, RangeValue } from "@gravity-ui/date-components";
import { useTimelineEvent } from "../../../react-components";
import {
  NUMBER_OF_INTERVALS,
  selectionToViewport,
  viewportToSelection,
} from "./RangeDateSelectionSyncedRuler";

type Interval = { start: number; end: number };

type Props<
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
> = {
  timeline: Timeline<TEvent, TMarker, TSection>;
  initialInterval: Interval;
  className?: string;
};

export const TimelineRuler: FC<Props> = ({
  timeline,
  initialInterval,
  className,
}) => {
  const [selection, setSelection] = useState<Interval>(() =>
    viewportToSelection(initialInterval.start, initialInterval.end),
  );

  const handleRangeUpdate = (value: RangeValue<DateTime>) => {
    const newSelection = {
      start: value.start.valueOf(),
      end: value.end.valueOf(),
    };
    setSelection(newSelection);

    const viewport = selectionToViewport(newSelection.start, newSelection.end);
    timeline.api.setRange(viewport.start, viewport.end);
  };

  useTimelineEvent(timeline, "on-camera-change", ({ from, to }) => {
    const newSelection = viewportToSelection(from, to);
    setSelection(newSelection);
  });

  return (
    <RangeDateSelection
      value={{
        start: dateTimeParse(selection.start),
        end: dateTimeParse(selection.end),
      }}
      onUpdate={handleRangeUpdate}
      className={className}
      draggableRuler
      numberOfIntervals={NUMBER_OF_INTERVALS}
    />
  );
};
