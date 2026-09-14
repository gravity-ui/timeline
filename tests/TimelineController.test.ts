import { afterEach, describe, expect, it, vi } from "vitest";
import { CanvasApi } from "../src/CanvasApi";
import { TimelineController } from "../src/TimelineController";
import { ZoomMode } from "../src/enums";
import {
  CameraInteractions,
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
  ViewConfigurationDefault,
} from "../src/types";

type TestApi = CanvasApi<TimelineEvent, TimelineMarker, TimelineSection>;

const createController = (
  zoom = ZoomMode.DEFAULT,
  interactions: CameraInteractions = {},
) => {
  const canvas = document.createElement("canvas");
  Object.defineProperties(canvas, {
    offsetWidth: { value: 200 },
    offsetHeight: { value: 100 },
  });

  let interval = { start: 0, end: 100_000 };
  const setRange = vi.fn((start: number, end: number) => {
    interval = { start, end };
  });
  const viewConfiguration = {
    camera: { zoom, interactions },
  } as ViewConfigurationDefault;
  const api = {
    canvas,
    rerender: vi.fn(),
    getInterval: () => interval,
    getViewConfiguration: () => viewConfiguration,
    positionToTime: (position: number) => position * 500,
    setRange,
    emit: vi.fn(),
  } as unknown as TestApi;

  const controller = new TimelineController(api);

  return {
    canvas,
    controller,
    getInterval: () => interval,
    setRange,
    viewConfiguration,
  };
};

const dispatchWheel = (
  canvas: HTMLCanvasElement,
  options: WheelEventInit = {},
) => {
  const event = new WheelEvent("wheel", {
    bubbles: true,
    cancelable: true,
    ...options,
  });
  Object.defineProperties(event, {
    offsetX: { value: 100 },
    offsetY: { value: 50 },
  });
  canvas.dispatchEvent(event);
  return event;
};

describe("TimelineController wheel interactions", () => {
  const controllers: TimelineController[] = [];

  afterEach(() => {
    controllers.splice(0).forEach((controller) => controller.destroy());
  });

  const setup = (...args: Parameters<typeof createController>) => {
    const result = createController(...args);
    controllers.push(result.controller);
    return result;
  };

  it("keeps the DEFAULT preset behavior", () => {
    const vertical = setup();
    const verticalEvent = dispatchWheel(vertical.canvas, { deltaY: 10 });
    expect(vertical.getInterval()).toEqual({ start: -7_500, end: 107_500 });
    expect(verticalEvent.defaultPrevented).toBe(true);

    const horizontal = setup();
    dispatchWheel(horizontal.canvas, { deltaX: 10 });
    expect(horizontal.getInterval()).toEqual({ start: 250, end: 100_250 });

    const shifted = setup();
    dispatchWheel(shifted.canvas, { deltaY: 10, shiftKey: true });
    expect(shifted.getInterval()).toEqual({ start: 250, end: 100_250 });

    const pinch = setup();
    dispatchWheel(pinch.canvas, { deltaY: 10, ctrlKey: true });
    expect(pinch.getInterval()).toEqual({ start: -7_500, end: 107_500 });
  });

  it("keeps the HORIZONTAL preset behavior", () => {
    const vertical = setup(ZoomMode.HORIZONTAL);
    dispatchWheel(vertical.canvas, { deltaY: 10 });
    expect(vertical.getInterval()).toEqual({ start: 250, end: 100_250 });

    const pinch = setup(ZoomMode.HORIZONTAL);
    dispatchWheel(pinch.canvas, { deltaY: 10, ctrlKey: true });
    expect(pinch.getInterval()).toEqual({ start: 250, end: 100_250 });
  });

  it("passes NONE preset events through to parent scroll containers", () => {
    const { canvas, getInterval } = setup(ZoomMode.NONE);
    const parent = document.createElement("div");
    const parentListener = vi.fn();
    parent.addEventListener("wheel", parentListener);
    parent.append(canvas);

    const event = dispatchWheel(canvas, { deltaY: 10 });

    expect(getInterval()).toEqual({ start: 0, end: 100_000 });
    expect(event.defaultPrevented).toBe(false);
    expect(parentListener).toHaveBeenCalledOnce();
  });

  it("applies interaction overrides over the selected preset", () => {
    const { canvas, getInterval } = setup(ZoomMode.DEFAULT, {
      verticalWheel: "pass-through",
      horizontalWheel: "pan",
      pinch: "zoom",
    });
    const parent = document.createElement("div");
    const parentListener = vi.fn();
    parent.addEventListener("wheel", parentListener);
    parent.append(canvas);

    const verticalEvent = dispatchWheel(canvas, { deltaY: 10 });
    expect(verticalEvent.defaultPrevented).toBe(false);
    expect(parentListener).toHaveBeenCalledOnce();
    expect(getInterval()).toEqual({ start: 0, end: 100_000 });

    const horizontalEvent = dispatchWheel(canvas, { deltaX: 10 });
    expect(horizontalEvent.defaultPrevented).toBe(true);
    expect(getInterval()).toEqual({ start: 250, end: 100_250 });

    dispatchWheel(canvas, { deltaY: -10, ctrlKey: true });
    expect(getInterval()).toEqual({ start: 5_225, end: 95_225 });
  });

  it("uses the dominant axis for diagonal wheel events", () => {
    const horizontal = setup(ZoomMode.DEFAULT, {
      verticalWheel: "pass-through",
    });
    dispatchWheel(horizontal.canvas, { deltaX: 10, deltaY: 5 });
    expect(horizontal.getInterval()).toEqual({ start: 250, end: 100_250 });

    const vertical = setup(ZoomMode.DEFAULT, {
      verticalWheel: "pass-through",
    });
    const event = dispatchWheel(vertical.canvas, { deltaX: 5, deltaY: 10 });
    expect(event.defaultPrevented).toBe(false);
    expect(vertical.getInterval()).toEqual({ start: 0, end: 100_000 });

    const equal = setup(ZoomMode.DEFAULT, {
      verticalWheel: "pass-through",
    });
    const equalEvent = dispatchWheel(equal.canvas, { deltaX: 10, deltaY: 10 });
    expect(equalEvent.defaultPrevented).toBe(false);
    expect(equal.getInterval()).toEqual({ start: 0, end: 100_000 });
  });

  it("removes the wheel listener on destroy", () => {
    const { canvas, controller, getInterval } = setup();
    controller.destroy();
    controllers.splice(controllers.indexOf(controller), 1);

    const event = dispatchWheel(canvas, { deltaY: 10 });
    expect(event.defaultPrevented).toBe(false);
    expect(getInterval()).toEqual({ start: 0, end: 100_000 });
  });
});
