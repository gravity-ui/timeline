import {
  FocusEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Timeline } from "../Timeline";
import { Events } from "../components/Events";
import { ComponentType, TimelineState } from "../enums";
import { TimelineEvent, TimelineMarker, TimelineSection } from "../types";
import { getEventAnchorElement } from "./getEventAnchorElement";

type PointerPosition = { clientX: number; clientY: number };

type UseEventPopupOptions<
  TEvent extends TimelineEvent,
  TMarker extends TimelineMarker,
  TSection extends TimelineSection,
> = {
  timeline: Timeline<TEvent, TMarker, TSection>;
  openDelay: number;
  closeDelay: number;
};

const getEvents = <
  TEvent extends TimelineEvent,
  TMarker extends TimelineMarker,
  TSection extends TimelineSection,
>(
  timeline: Timeline<TEvent, TMarker, TSection>,
) =>
  timeline.api?.getComponent<Events<TEvent, TMarker, TSection>>(
    ComponentType.Events,
  );

export const useEventPopup = <
  TEvent extends TimelineEvent,
  TMarker extends TimelineMarker,
  TSection extends TimelineSection,
>({
  timeline,
  openDelay,
  closeDelay,
}: UseEventPopupOptions<TEvent, TMarker, TSection>) => {
  const [activeEventState, setActiveEventState] = useState<{
    timeline: Timeline<TEvent, TMarker, TSection>;
    eventId: string;
  }>();
  const [, setAnchorVersion] = useState(0);
  const [lifecycleVersion, setLifecycleVersion] = useState(0);
  const activeEventIdRef = useRef<string>();
  const pendingEventIdRef = useRef<string>();
  const hoveredEventIdRef = useRef<string>();
  const pointerPositionRef = useRef<PointerPosition>();
  const pointerInPopupRef = useRef(false);
  const focusInPopupRef = useRef(false);
  const dismissedEventIdRef = useRef<string>();
  const openTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const frameRef = useRef<number>();
  const floatingRef = useRef<HTMLDivElement>(null);

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    openTimerRef.current = undefined;
    pendingEventIdRef.current = undefined;
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = undefined;
  }, []);

  const close = useCallback(
    (dismiss = false) => {
      clearOpenTimer();
      clearCloseTimer();
      if (dismiss && activeEventIdRef.current !== undefined) {
        dismissedEventIdRef.current =
          hoveredEventIdRef.current === activeEventIdRef.current
            ? activeEventIdRef.current
            : undefined;
      }
      if (floatingRef.current?.contains(document.activeElement)) {
        timeline.canvas?.focus();
      }
      activeEventIdRef.current = undefined;
      setActiveEventState(undefined);
    },
    [clearCloseTimer, clearOpenTimer, timeline],
  );

  const scheduleClose = useCallback(() => {
    if (pointerInPopupRef.current || focusInPopupRef.current) return;
    clearOpenTimer();
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => close(), closeDelay);
  }, [clearCloseTimer, clearOpenTimer, close, closeDelay]);

  const leaveHoveredEvent = useCallback(() => {
    const hoveredEventId = hoveredEventIdRef.current;
    if (dismissedEventIdRef.current === hoveredEventId) {
      dismissedEventIdRef.current = undefined;
    }
    hoveredEventIdRef.current = undefined;
    scheduleClose();
  }, [scheduleClose]);

  const open = useCallback(
    (event: TEvent) => {
      clearCloseTimer();
      if (dismissedEventIdRef.current === event.id) return;
      if (activeEventIdRef.current === event.id) return;
      if (pendingEventIdRef.current === event.id) return;

      if (activeEventIdRef.current !== undefined) {
        activeEventIdRef.current = event.id;
        setActiveEventState({ timeline, eventId: event.id });
        return;
      }

      clearOpenTimer();
      pendingEventIdRef.current = event.id;
      openTimerRef.current = setTimeout(() => {
        openTimerRef.current = undefined;
        pendingEventIdRef.current = undefined;
        if (hoveredEventIdRef.current !== event.id) return;
        activeEventIdRef.current = event.id;
        setActiveEventState({ timeline, eventId: event.id });
      }, openDelay);
    },
    [clearCloseTimer, clearOpenTimer, openDelay, timeline],
  );

  const refreshFromPointer = useCallback(() => {
    if (timeline.state !== TimelineState.READY || !pointerPositionRef.current) {
      return;
    }

    const canvasRect = timeline.canvas.getBoundingClientRect();
    const { clientX, clientY } = pointerPositionRef.current;
    const event = getEvents(timeline)?.getTopEventAtPoint(
      clientX - canvasRect.left,
      clientY - canvasRect.top,
    );
    const previousId = hoveredEventIdRef.current;
    hoveredEventIdRef.current = event?.id;

    if (event) {
      if (
        dismissedEventIdRef.current !== undefined &&
        dismissedEventIdRef.current !== event.id
      ) {
        dismissedEventIdRef.current = undefined;
      }
      open(event);
    } else if (previousId !== undefined) {
      if (dismissedEventIdRef.current === previousId) {
        dismissedEventIdRef.current = undefined;
      }
      scheduleClose();
    }
  }, [open, scheduleClose, timeline]);

  const scheduleRefresh = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = undefined;
      refreshFromPointer();
      if (activeEventIdRef.current !== undefined) {
        setAnchorVersion((version) => version + 1);
      }
    });
  }, [refreshFromPointer]);

  useEffect(() => {
    activeEventIdRef.current = undefined;
    pendingEventIdRef.current = undefined;
    hoveredEventIdRef.current = undefined;
    pointerPositionRef.current = undefined;
    pointerInPopupRef.current = false;
    focusInPopupRef.current = false;
    dismissedEventIdRef.current = undefined;
    setActiveEventState(undefined);
  }, [timeline]);

  useEffect(() => {
    const handleHover = (event: Event) => {
      const { relativeX, relativeY } = (event as CustomEvent).detail;
      pointerPositionRef.current = { clientX: relativeX, clientY: relativeY };
      refreshFromPointer();
    };
    const handleLeave = (event: Event) => {
      const events = (event as CustomEvent).detail.events as TEvent[];
      if (!events.some((item) => item.id === hoveredEventIdRef.current)) return;
      leaveHoveredEvent();
    };
    const handleCanvasPointerChange = (event: MouseEvent) => {
      pointerPositionRef.current = {
        clientX: event.clientX,
        clientY: event.clientY,
      };
      refreshFromPointer();
    };
    const handleCanvasLeave = () => {
      pointerPositionRef.current = undefined;
      leaveHoveredEvent();
    };
    const handleWindowChange = () => scheduleRefresh();
    const handleReady = () => {
      setLifecycleVersion((version) => version + 1);
      scheduleRefresh();
    };
    const handleRender = () => {
      if (
        activeEventIdRef.current !== undefined &&
        !getEvents(timeline)?.getEventById(activeEventIdRef.current)
      ) {
        close();
        return;
      }
      if (pointerPositionRef.current) {
        scheduleRefresh();
      } else if (activeEventIdRef.current !== undefined) {
        setAnchorVersion((version) => version + 1);
      }
    };
    const handleDestroy = () => {
      pointerPositionRef.current = undefined;
      hoveredEventIdRef.current = undefined;
      dismissedEventIdRef.current = undefined;
      setLifecycleVersion((version) => version + 1);
      close();
    };

    timeline.on("on-hover", handleHover);
    timeline.on("on-leave", handleLeave);
    timeline.on("on-ready", handleReady);
    timeline.on("on-render", handleRender);
    timeline.on("on-destroy", handleDestroy);
    window.addEventListener("resize", handleWindowChange);
    window.addEventListener("scroll", handleWindowChange, true);

    const canvas =
      timeline.state === TimelineState.READY ? timeline.canvas : undefined;
    canvas?.addEventListener("mouseenter", handleCanvasPointerChange);
    canvas?.addEventListener("mousemove", handleCanvasPointerChange);
    canvas?.addEventListener("mouseleave", handleCanvasLeave);
    const observer = canvas
      ? new ResizeObserver(handleWindowChange)
      : undefined;
    observer?.observe(canvas);

    return () => {
      timeline.off("on-hover", handleHover);
      timeline.off("on-leave", handleLeave);
      timeline.off("on-ready", handleReady);
      timeline.off("on-render", handleRender);
      timeline.off("on-destroy", handleDestroy);
      window.removeEventListener("resize", handleWindowChange);
      window.removeEventListener("scroll", handleWindowChange, true);
      canvas?.removeEventListener("mouseenter", handleCanvasPointerChange);
      canvas?.removeEventListener("mousemove", handleCanvasPointerChange);
      canvas?.removeEventListener("mouseleave", handleCanvasLeave);
      observer?.disconnect();
      clearOpenTimer();
      clearCloseTimer();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [
    clearCloseTimer,
    clearOpenTimer,
    close,
    leaveHoveredEvent,
    refreshFromPointer,
    scheduleRefresh,
    timeline,
    lifecycleVersion,
  ]);

  const activeEventId =
    activeEventState?.timeline === timeline
      ? activeEventState.eventId
      : undefined;
  const activeEvent =
    activeEventId === undefined
      ? undefined
      : getEvents(timeline)?.getEventById(activeEventId);
  const anchorElement =
    activeEvent && timeline.state === TimelineState.READY
      ? getEventAnchorElement(timeline, activeEvent)
      : undefined;

  const handlePopupMouseEnter: MouseEventHandler<HTMLDivElement> = () => {
    pointerInPopupRef.current = true;
    clearCloseTimer();
  };
  const handlePopupMouseLeave: MouseEventHandler<HTMLDivElement> = () => {
    pointerInPopupRef.current = false;
    if (hoveredEventIdRef.current === undefined) scheduleClose();
  };
  const handlePopupFocus: FocusEventHandler<HTMLDivElement> = () => {
    focusInPopupRef.current = true;
    clearCloseTimer();
  };
  const handlePopupBlur: FocusEventHandler<HTMLDivElement> = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      focusInPopupRef.current = false;
      if (hoveredEventIdRef.current === undefined) scheduleClose();
    }
  };

  return {
    activeEvent,
    anchorElement,
    floatingRef,
    close,
    popupInteractionProps: {
      onMouseEnter: handlePopupMouseEnter,
      onMouseLeave: handlePopupMouseLeave,
      onFocus: handlePopupFocus,
      onBlur: handlePopupBlur,
    },
  };
};
