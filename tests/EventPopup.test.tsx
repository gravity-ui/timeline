import React, { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TimelineState } from "../src/enums";
import { TimelineEvent } from "../src/types";

vi.mock("@gravity-ui/uikit", () => ({
  useThemeValue: () => "light",
  Popup: ({
    children,
    onOpenChange,
  }: {
    children: React.ReactNode;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div>
      {children}
      <button type="button" onClick={() => onOpenChange(false)}>
        Dismiss
      </button>
    </div>
  ),
}));

import { EventPopup } from "../src/react-uikit";

const event: TimelineEvent = {
  id: "event-1",
  from: 0,
  to: 10,
  axisId: "main",
  trackIndex: 0,
};

const createTimeline = (timelineEvent: TimelineEvent = event) => {
  const emitter = new EventTarget();
  const canvas = document.createElement("canvas");
  canvas.getBoundingClientRect = () => new DOMRect(10, 20, 300, 100);
  const events = {
    getTopEventAtPoint: vi.fn((x: number) =>
      x < 100 ? timelineEvent : undefined,
    ),
    getEventById: vi.fn((id: string) =>
      id === timelineEvent.id ? timelineEvent : undefined,
    ),
  };
  return {
    state: TimelineState.READY,
    canvas,
    api: {
      getComponent: () => events,
      getEventPosition: () => ({ x0: 0, x1: 50, y0: 30, h: 20 }),
      getRulerHeight: () => 0,
    },
    on: (type: string, listener: EventListener) =>
      emitter.addEventListener(type, listener),
    off: (type: string, listener: EventListener) =>
      emitter.removeEventListener(type, listener),
    emit: (type: string, detail: unknown) =>
      emitter.dispatchEvent(new CustomEvent(type, { detail })),
  };
};

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount((value) => value + 1)}>
      Count {count}
    </button>
  );
};

describe("EventPopup", () => {
  beforeEach(() => vi.useFakeTimers());

  it("opens after hover delay and closes after leaving an event", () => {
    const timeline = createTimeline();
    render(
      <EventPopup
        timeline={timeline as never}
        content={(item) => <button type="button">{item.id}</button>}
      />,
    );

    act(() => {
      timeline.emit("on-hover", { relativeX: 20, relativeY: 30 });
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByRole("button", { name: "event-1" })).toBeTruthy();

    act(() => {
      timeline.emit("on-leave", { events: [event] });
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByRole("button", { name: "event-1" })).toBeNull();
  });

  it("keeps an interactive popup open while its content is hovered", () => {
    const timeline = createTimeline();
    const onClick = vi.fn();
    render(
      <EventPopup
        timeline={timeline as never}
        content={() => <button onClick={onClick}>Action</button>}
      />,
    );

    act(() => {
      timeline.emit("on-hover", { relativeX: 20, relativeY: 30 });
      vi.advanceTimersByTime(150);
    });
    const button = screen.getByRole("button", { name: "Action" });
    fireEvent.mouseEnter(button.parentElement as HTMLElement);
    act(() => {
      timeline.emit("on-leave", { events: [event] });
      vi.advanceTimersByTime(200);
    });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("reopens the same event after dismissal and a genuine leave", () => {
    const timeline = createTimeline();
    render(
      <EventPopup
        timeline={timeline as never}
        content={() => <span>Content</span>}
      />,
    );

    act(() => {
      timeline.emit("on-hover", { relativeX: 20, relativeY: 30 });
      vi.advanceTimersByTime(150);
    });
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    act(() => {
      timeline.emit("on-leave", { events: [event] });
      vi.advanceTimersByTime(200);
      timeline.emit("on-hover", { relativeX: 20, relativeY: 30 });
      vi.advanceTimersByTime(150);
    });

    expect(screen.getByText("Content")).toBeTruthy();
  });

  it("reopens when dismissal happens after leaving the event", () => {
    const timeline = createTimeline();
    render(
      <EventPopup
        timeline={timeline as never}
        content={() => <span>Content</span>}
      />,
    );

    act(() => {
      timeline.emit("on-hover", { relativeX: 20, relativeY: 30 });
      vi.advanceTimersByTime(150);
    });
    act(() => {
      timeline.emit("on-leave", { events: [event] });
    });
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    act(() => {
      timeline.emit("on-hover", { relativeX: 20, relativeY: 30 });
      vi.advanceTimersByTime(150);
    });

    expect(screen.getByText("Content")).toBeTruthy();
  });

  it("resets popup state when the timeline changes", () => {
    const firstTimeline = createTimeline();
    const secondEvent = { ...event };
    const secondTimeline = createTimeline(secondEvent);
    const { rerender } = render(
      <EventPopup
        timeline={firstTimeline as never}
        content={(item) => <span>{item.id}</span>}
      />,
    );

    act(() => {
      firstTimeline.emit("on-hover", { relativeX: 20, relativeY: 30 });
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByText(event.id)).toBeTruthy();

    rerender(
      <EventPopup
        timeline={secondTimeline as never}
        content={(item) => <span>{item.id}</span>}
      />,
    );
    expect(screen.queryByText(event.id)).toBeNull();

    act(() => {
      secondTimeline.emit("on-hover", { relativeX: 20, relativeY: 30 });
      vi.advanceTimersByTime(149);
    });
    expect(screen.queryByText(secondEvent.id)).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByText(secondEvent.id)).toBeTruthy();
  });

  it("supports an empty string event id", () => {
    const timeline = createTimeline({ ...event, id: "" });
    render(
      <EventPopup
        timeline={timeline as never}
        content={() => <span>Empty ID event</span>}
      />,
    );

    act(() => {
      timeline.emit("on-hover", { relativeX: 20, relativeY: 30 });
      vi.advanceTimersByTime(150);
    });

    expect(screen.getByText("Empty ID event")).toBeTruthy();
  });

  it("preserves popup content state across a timeline render", () => {
    const timeline = createTimeline();
    render(
      <EventPopup
        timeline={timeline as never}
        content={() => <Counter />}
      />,
    );

    act(() => {
      timeline.emit("on-hover", { relativeX: 20, relativeY: 30 });
      vi.advanceTimersByTime(150);
    });
    fireEvent.click(screen.getByRole("button", { name: "Count 0" }));
    act(() => {
      timeline.emit("on-render", {});
      vi.runAllTimers();
    });

    expect(screen.getByRole("button", { name: "Count 1" })).toBeTruthy();
  });

  it("uses the latest canvas pointer position when a render precedes leave", () => {
    const timeline = createTimeline();
    render(
      <EventPopup
        timeline={timeline as never}
        content={() => <span>Content</span>}
      />,
    );

    act(() => {
      timeline.emit("on-hover", { relativeX: 20, relativeY: 30 });
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByText("Content")).toBeTruthy();

    act(() => {
      timeline.emit("on-render", {});
      timeline.emit("on-leave", { events: [event] });
      timeline.canvas.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 200, clientY: 90 }),
      );
      vi.runAllTimers();
    });

    expect(screen.queryByText("Content")).toBeNull();
  });

  it("does not restart the open delay while the pointer moves over an event", () => {
    const timeline = createTimeline();
    render(
      <EventPopup
        timeline={timeline as never}
        content={() => <span>Content</span>}
      />,
    );

    act(() => {
      timeline.emit("on-hover", { relativeX: 20, relativeY: 30 });
      vi.advanceTimersByTime(50);
      timeline.canvas.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 30, clientY: 30 }),
      );
      vi.advanceTimersByTime(50);
      timeline.canvas.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 40, clientY: 30 }),
      );
      vi.advanceTimersByTime(50);
    });

    expect(screen.getByText("Content")).toBeTruthy();
  });

  it("stays closed after dismissal until the pointer returns to the event", () => {
    const timeline = createTimeline();
    render(
      <EventPopup
        timeline={timeline as never}
        content={() => <span>Content</span>}
      />,
    );

    act(() => {
      timeline.emit("on-hover", { relativeX: 20, relativeY: 30 });
      vi.advanceTimersByTime(150);
    });
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    act(() => {
      timeline.emit("on-render", {});
      timeline.emit("on-leave", { events: [event] });
      timeline.canvas.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 200, clientY: 90 }),
      );
      vi.runAllTimers();
    });
    expect(screen.queryByText("Content")).toBeNull();

    act(() => {
      timeline.canvas.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 20, clientY: 30 }),
      );
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByText("Content")).toBeTruthy();
  });
});
