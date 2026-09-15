import { describe, expect, it, vi } from "vitest";
import { CanvasApi } from "../src/CanvasApi";
import { Events } from "../src/components/Events";
import {
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
  ViewConfigurationDefault,
} from "../src/types";

type TestApi = CanvasApi<TimelineEvent, TimelineMarker, TimelineSection>;

const createCursorEvents = (input: TimelineEvent | TimelineEvent[]) => {
  const events = Array.isArray(input) ? input : [input];
  const canvas = document.createElement("canvas");
  canvas.style.cursor = "crosshair";
  const api = {
    canvas,
    rerender: vi.fn(),
    getViewConfiguration: () =>
      ({ events: { hitboxPadding: 0 } }) as ViewConfigurationDefault,
    getInterval: () => ({ start: 0, end: 10 }),
    getComponent: () => undefined,
    getRulerHeight: () => 0,
    canvasScrollTop: 0,
    positionToTime: (position: number) => position,
  } as unknown as TestApi;
  const component = new Events(api);
  (component as unknown as { _events: TimelineEvent[] })._events = events;
  component.getEventsAtPoint = vi.fn(() => events);

  return { canvas, component };
};

const movePointer = (canvas: HTMLCanvasElement) => {
  const event = new MouseEvent("mousemove");
  Object.defineProperties(event, {
    offsetX: { value: 10 },
    offsetY: { value: 10 },
  });
  canvas.dispatchEvent(event);
};

describe("Events.getTopEventAtPoint", () => {
  it("uses data order rather than RBush result order", () => {
    const events = Object.create(Events.prototype) as Events;
    const first = { id: "first" };
    const second = { id: "second" };
    (events as unknown as { _events: unknown[] })._events = [first, second];
    events.getEventsAtPoint = vi.fn(() => [second, first]) as never;

    expect(events.getTopEventAtPoint(0, 0)).toBe(second);
  });
});

describe("Events event cursor", () => {
  const baseEvent: TimelineEvent = {
    id: "event",
    from: 0,
    to: 10,
    axisId: "axis",
    trackIndex: 0,
  };

  it("applies an event cursor and restores the previous cursor on leave", () => {
    const { canvas } = createCursorEvents({
      ...baseEvent,
      cursor: "pointer",
    });

    movePointer(canvas);
    expect(canvas.style.cursor).toBe("pointer");

    canvas.dispatchEvent(new MouseEvent("mouseleave"));
    expect(canvas.style.cursor).toBe("crosshair");
  });

  it("does not change the cursor for events without a cursor", () => {
    const { canvas } = createCursorEvents([baseEvent]);

    movePointer(canvas);

    expect(canvas.style.cursor).toBe("crosshair");
  });

  it("uses the top-most event cursor and does not inherit it from lower events", () => {
    const lowerEvent = { ...baseEvent, id: "lower", cursor: "pointer" };
    const topEvent = { ...baseEvent, id: "top", cursor: "grab" };
    const { canvas, component } = createCursorEvents([lowerEvent, topEvent]);

    movePointer(canvas);
    expect(canvas.style.cursor).toBe("grab");

    (component as unknown as { _events: TimelineEvent[] })._events = [
      lowerEvent,
      { ...topEvent, cursor: undefined },
    ];
    movePointer(canvas);
    expect(canvas.style.cursor).toBe("crosshair");
  });

  it("updates the cursor when rendering after events change", () => {
    const { canvas, component } = createCursorEvents({
      ...baseEvent,
      cursor: "pointer",
    });

    movePointer(canvas);
    expect(canvas.style.cursor).toBe("pointer");

    (component as unknown as { _events: TimelineEvent[] })._events = [];
    component.render();

    expect(canvas.style.cursor).toBe("crosshair");
  });

  it("does not reacquire the cursor while an external cursor is active", () => {
    const { canvas } = createCursorEvents({
      ...baseEvent,
      cursor: "pointer",
    });

    movePointer(canvas);
    canvas.style.cursor = "grabbing";

    movePointer(canvas);
    movePointer(canvas);
    expect(canvas.style.cursor).toBe("grabbing");

    canvas.style.cursor = "crosshair";
    movePointer(canvas);
    expect(canvas.style.cursor).toBe("pointer");
  });

  it("releases its cursor on destroy without overwriting an external cursor", () => {
    const { canvas, component } = createCursorEvents({
      ...baseEvent,
      cursor: "pointer",
    });

    movePointer(canvas);
    component.destroy();
    expect(canvas.style.cursor).toBe("crosshair");

    const external = createCursorEvents({ ...baseEvent, cursor: "pointer" });
    movePointer(external.canvas);
    external.canvas.style.cursor = "grabbing";
    external.component.destroy();
    expect(external.canvas.style.cursor).toBe("grabbing");
  });
});
