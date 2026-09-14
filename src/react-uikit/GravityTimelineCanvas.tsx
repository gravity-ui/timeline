import React, { useEffect } from "react";
import { useThemeValue } from "@gravity-ui/uikit";
import { TimelineState } from "../enums";
import {
  TimelineCanvas,
  TimelineCanvasProps,
} from "../react-components/TimelineCanvas";
import { TimelineEvent, TimelineMarker, TimelineSection } from "../types";

/**
 * A TimelineCanvas that redraws when the surrounding Gravity UI theme changes.
 * Use it with ThemeProvider when timeline colors contain CSS custom properties.
 */
export const GravityTimelineCanvas = <
  TEvent extends TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
>(
  props: TimelineCanvasProps<TEvent, TMarker, TSection>,
) => {
  const themeValue = useThemeValue();

  useEffect(() => {
    if (props.timeline.state === TimelineState.READY) {
      props.timeline.api.rerender();
    }
  }, [props.timeline, themeValue]);

  return <TimelineCanvas {...props} />;
};
