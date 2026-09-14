import { Timeline } from "../Timeline";
import { TimelineEvent, TimelineMarker, TimelineSection } from "../types";

export type EventPopupAnchorElement = {
  contextElement: Element;
  getBoundingClientRect: () => DOMRect;
};

export const getEventAnchorElement = <
  TEvent extends TimelineEvent,
  TMarker extends TimelineMarker,
  TSection extends TimelineSection,
>(
  timeline: Timeline<TEvent, TMarker, TSection>,
  event: TEvent,
): EventPopupAnchorElement => ({
  contextElement: timeline.canvas,
  getBoundingClientRect: () => {
    const canvasRect = timeline.canvas.getBoundingClientRect();
    const position = timeline.api.getEventPosition(event);
    const rulerHeight = timeline.api.getRulerHeight();
    const left = Math.max(canvasRect.left, canvasRect.left + position.x0);
    const right = Math.min(canvasRect.right, canvasRect.left + position.x1);
    const top = Math.max(
      canvasRect.top + rulerHeight,
      canvasRect.top + position.y0 - position.h / 2,
    );
    const bottom = Math.min(
      canvasRect.bottom,
      canvasRect.top + position.y0 + position.h / 2,
    );

    return new DOMRect(
      left,
      top,
      Math.max(right - left, 1),
      Math.max(bottom - top, 1),
    );
  },
});
