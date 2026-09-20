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

const createIndexedEvents = () => {
  const canvas = document.createElement("canvas");
  const axis = { id: "axis", top: 0, height: 20, tracksCount: 2 };
  const api = {
    canvas,
    rerender: vi.fn(),
    getViewConfiguration: () => ({ events: { hitboxPadding: 2 } }),
    getInterval: () => ({ start: 0, end: 100 }),
    getComponent: () => ({
      getAxesById: () => ({ axis }),
      getAxisTrackPosition: (_axis: unknown, track: number) => track * 20 + 10,
    }),
    getRulerHeight: () => 30,
    canvasScrollTop: 0,
    positionToTime: (position: number) => position,
  } as unknown as TestApi;
  const component = new Events(api);
  const first: TimelineEvent = {
    id: "first", axisId: "axis", trackIndex: 0, from: 10, to: 50,
    cursor: "pointer",
  };
  const second = { ...first, id: "second", from: 30, to: 70, cursor: "grab" };
  component.setEvents([first, second]);
  return { component, api, canvas, first, second };
};

describe("Events.getTopEventAtPoint", () => {
  it("prefers exact hits to a higher event inside the tolerance", () => {
    const { component, first, second } = createIndexedEvents();
    expect(component.getEventsAtPoint(28, 40)).toEqual(expect.arrayContaining([first, second]));
    expect(component.getTopEventAtPoint(28, 40)).toBe(first);
    expect(component.getTopEventAtPoint(30, 40)).toBe(second);
  });

  it("uses drawing order regardless of spatial index traversal order", () => {
    const { component, first, second } = createIndexedEvents();
    expect(component.getTopEventAtPoint(40, 40)).toBe(second);
    component.setEvents([second, first]);
    expect(component.getTopEventAtPoint(40, 40)).toBe(first);
  });

  it("retains tolerance only when no exact hits exist", () => {
    const { component, second } = createIndexedEvents();
    expect(component.getTopEventAtPoint(75, 40)).toBe(second);
    expect(component.getTopEventAtPoint(76, 40)).toBeUndefined();
  });

  it("uses exact vertical bounds and accounts for scrolling and zoom", () => {
    const { component, api, first, second } = createIndexedEvents();
    component.setEvents([first, { ...second, trackIndex: 1 }]);
    expect(component.getTopEventAtPoint(40, 49)).toBe(first);
    api.canvasScrollTop = 10;
    api.positionToTime = (x) => x / 2;
    expect(component.getTopEventAtPoint(80, 39)).toBe(first);
    expect(component.getTopEventAtPoint(80, 41)?.id).toBe(second.id);
  });

  it("shares the top event between hover and cursor and clears hover on leave", () => {
    const { component, canvas, first, second } = createIndexedEvents();
    const move = (x: number) => {
      const event = new MouseEvent("mousemove");
      Object.defineProperties(event, {
        offsetX: { value: x }, offsetY: { value: 40 },
      });
      canvas.dispatchEvent(event);
    };
    move(28);
    expect(component.isHoveredEvent(first)).toBe(true);
    expect(component.isHoveredEvent(second)).toBe(false);
    expect(canvas.style.cursor).toBe("pointer");
    move(40);
    expect(component.isHoveredEvent(first)).toBe(false);
    expect(component.isHoveredEvent(second)).toBe(true);
    expect(canvas.style.cursor).toBe("grab");
    canvas.dispatchEvent(new MouseEvent("mouseleave"));
    expect(component.isHoveredEvent(second)).toBe(false);
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
