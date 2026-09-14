import React, { ReactNode } from "react";
import { Popup, PopupOffset, PopupPlacement } from "@gravity-ui/uikit";
import { Timeline } from "../Timeline";
import { TimelineEvent, TimelineMarker, TimelineSection } from "../types";
import { useEventPopup } from "./useEventPopup";

export type EventPopupProps<
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
> = {
  timeline: Timeline<TEvent, TMarker, TSection>;
  content: (event: TEvent) => ReactNode;
  openDelay?: number;
  closeDelay?: number;
  placement?: PopupPlacement;
  offset?: PopupOffset;
  className?: string;
  "aria-label"?: string;
};

export const EventPopup = <
  TEvent extends TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
>({
  timeline,
  content,
  openDelay = 150,
  closeDelay = 200,
  placement = "top",
  offset = 8,
  className,
  "aria-label": ariaLabel,
}: EventPopupProps<TEvent, TMarker, TSection>) => {
  const {
    activeEvent,
    anchorElement,
    floatingRef,
    close,
    popupInteractionProps,
  } = useEventPopup({ timeline, openDelay, closeDelay });
  const popupContent = activeEvent ? content(activeEvent) : null;

  if (!activeEvent || !anchorElement || popupContent === null) return null;

  return (
    <Popup
      anchorElement={anchorElement}
      className={className}
      open
      modal={false}
      initialFocus={-1}
      placement={placement}
      offset={offset}
      strategy="fixed"
      role="dialog"
      aria-label={ariaLabel}
      floatingRef={floatingRef}
      onOpenChange={(isOpen) => {
        if (!isOpen) close(true);
      }}
    >
      <div {...popupInteractionProps}>{popupContent}</div>
    </Popup>
  );
};
