import { afterEach, describe, expect, it, vi } from "vitest";
import { CanvasApi } from "../src/CanvasApi";
import { TimelineController } from "../src/TimelineController";
import { ZoomMode } from "../src/enums";
import {
  CameraInteractions,
  CameraViewOptions,
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
  ViewConfigurationDefault,
} from "../src/types";

type TestApi = CanvasApi<TimelineEvent, TimelineMarker, TimelineSection>;
const DAY = 24 * 60 * 60 * 1000;

const createController = (
  zoom = ZoomMode.DEFAULT,
  interactions: CameraInteractions = {},
  initialInterval = { start: 0, end: 100_000 },
  rangeLimits: Pick<CameraViewOptions, "minRange" | "maxRange"> = {},
  positionToTime = (position: number) => position * 500,
  zoomSensitivity: CameraViewOptions["zoomSensitivity"] = {},
) => {
  const canvas = document.createElement("canvas");
  Object.defineProperties(canvas, {
    offsetWidth: { value: 200 },
    offsetHeight: { value: 100 },
  });

  let interval = initialInterval;
  const setRange = vi.fn((start: number, end: number) => {
    interval = { start, end };
  });
  const viewConfiguration = {
    camera: { zoom, interactions, zoomSensitivity, ...rangeLimits },
  } as ViewConfigurationDefault;
  const api = {
    canvas,
    rerender: vi.fn(),
    getInterval: () => interval,
    getViewConfiguration: () => viewConfiguration,
    positionToTime,
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
    const verticalEvent = dispatchWheel(vertical.canvas, {
      deltaY: 10,
      deltaMode: WheelEvent.DOM_DELTA_PIXEL,
    });
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

  it("applies a proportional zoom step to small pixel deltas", () => {
    const zoomOut = setup();
    dispatchWheel(zoomOut.canvas, {
      deltaY: 5,
      deltaMode: WheelEvent.DOM_DELTA_PIXEL,
    });
    expect(zoomOut.getInterval()).toEqual({ start: -3_619, end: 103_619 });

    const zoomIn = setup();
    dispatchWheel(zoomIn.canvas, {
      deltaY: -5,
      deltaMode: WheelEvent.DOM_DELTA_PIXEL,
    });
    expect(zoomIn.getInterval()).toEqual({ start: 2_566, end: 97_434 });
  });

  it("keeps equivalent accumulated pixel deltas close to one full step", () => {
    const initialInterval = { start: 0, end: 1_000_000_000 };
    const positionToTime = () => 500_000_000;
    const accumulated = setup(
      ZoomMode.DEFAULT,
      {},
      initialInterval,
      {},
      positionToTime,
    );
    const fullStep = setup(
      ZoomMode.DEFAULT,
      {},
      initialInterval,
      {},
      positionToTime,
    );

    dispatchWheel(accumulated.canvas, { deltaY: -5 });
    dispatchWheel(accumulated.canvas, { deltaY: -5 });
    dispatchWheel(fullStep.canvas, { deltaY: -10 });

    expect(accumulated.getInterval()).toEqual(fullStep.getInterval());
  });

  it("uses a full zoom step for line and page wheel deltas", () => {
    const line = setup();
    dispatchWheel(line.canvas, {
      deltaY: 1,
      deltaMode: WheelEvent.DOM_DELTA_LINE,
    });
    expect(line.getInterval()).toEqual({ start: -7_500, end: 107_500 });

    const page = setup();
    dispatchWheel(page.canvas, {
      deltaY: -1,
      deltaMode: WheelEvent.DOM_DELTA_PAGE,
    });
    expect(page.getInterval()).toEqual({ start: 5_000, end: 95_000 });
  });

  it("applies independent zoom in and zoom out sensitivity", () => {
    const zoomIn = setup(
      ZoomMode.DEFAULT,
      {},
      undefined,
      {},
      undefined,
      { in: 0.5, out: 2 },
    );
    dispatchWheel(zoomIn.canvas, { deltaY: -10 });
    expect(zoomIn.getInterval()).toEqual({ start: 2_566, end: 97_434 });

    const zoomOut = setup(
      ZoomMode.DEFAULT,
      {},
      undefined,
      {},
      undefined,
      { in: 0.5, out: 2 },
    );
    dispatchWheel(zoomOut.canvas, { deltaY: 10 });
    expect(zoomOut.getInterval()).toEqual({ start: -16_125, end: 116_125 });
  });

  it("supports zero sensitivity and falls back for invalid values", () => {
    const disabled = setup(
      ZoomMode.DEFAULT,
      {},
      undefined,
      {},
      undefined,
      { in: 0, out: 0 },
    );
    const disabledEvent = dispatchWheel(disabled.canvas, { deltaY: 10 });
    expect(disabled.getInterval()).toEqual({ start: 0, end: 100_000 });
    expect(disabledEvent.defaultPrevented).toBe(true);

    const invalid = setup(
      ZoomMode.DEFAULT,
      {},
      undefined,
      {},
      undefined,
      { in: -1, out: Number.NaN },
    );
    dispatchWheel(invalid.canvas, { deltaY: 10 });
    expect(invalid.getInterval()).toEqual({ start: -7_500, end: 107_500 });
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

  it("does not collapse a wide range with the default zoom limits", () => {
    const zoomIn = setup(ZoomMode.DEFAULT, {}, { start: 0, end: 120 * DAY });
    dispatchWheel(zoomIn.canvas, { deltaY: -10, ctrlKey: true });
    expect(zoomIn.getInterval().end - zoomIn.getInterval().start).toBe(
      108 * DAY,
    );

    const zoomOut = setup(ZoomMode.DEFAULT, {}, { start: 0, end: 120 * DAY });
    dispatchWheel(zoomOut.canvas, { deltaY: 10, ctrlKey: true });
    expect(zoomOut.getInterval().end - zoomOut.getInterval().start).toBe(
      138 * DAY,
    );
  });

  it("applies a configured maximum range without collapsing wider external ranges", () => {
    const atMaximum = setup(
      ZoomMode.DEFAULT,
      {},
      { start: 0, end: 80 * DAY },
      { minRange: 5_000, maxRange: 90 * DAY },
    );
    dispatchWheel(atMaximum.canvas, { deltaY: 10, ctrlKey: true });
    expect(atMaximum.getInterval().end - atMaximum.getInterval().start).toBe(
      90 * DAY,
    );

    const aboveMaximum = setup(
      ZoomMode.DEFAULT,
      {},
      { start: 0, end: 120 * DAY },
      { minRange: 5_000, maxRange: 90 * DAY },
    );
    dispatchWheel(aboveMaximum.canvas, { deltaY: -10, ctrlKey: true });
    expect(
      aboveMaximum.getInterval().end - aboveMaximum.getInterval().start,
    ).toBe(108 * DAY);

    const aboveMaximumZoomOut = setup(
      ZoomMode.DEFAULT,
      {},
      { start: 0, end: 120 * DAY },
      { minRange: 5_000, maxRange: 90 * DAY },
    );
    dispatchWheel(aboveMaximumZoomOut.canvas, { deltaY: 10, ctrlKey: true });
    expect(aboveMaximumZoomOut.getInterval()).toEqual({
      start: 0,
      end: 120 * DAY,
    });
  });

  it("respects default and configured minimum ranges", () => {
    const defaultMinimum = setup(
      ZoomMode.DEFAULT,
      {},
      { start: 0, end: 5_100 },
    );
    dispatchWheel(defaultMinimum.canvas, { deltaY: -10, ctrlKey: true });
    expect(
      defaultMinimum.getInterval().end - defaultMinimum.getInterval().start,
    ).toBe(5_000);

    const configuredMinimum = setup(
      ZoomMode.DEFAULT,
      {},
      { start: 0, end: 11_000 },
      { minRange: 10_000 },
    );
    dispatchWheel(configuredMinimum.canvas, { deltaY: -10, ctrlKey: true });
    expect(
      configuredMinimum.getInterval().end -
        configuredMinimum.getInterval().start,
    ).toBe(10_000);

    const belowMinimum = setup(ZoomMode.DEFAULT, {}, { start: 0, end: 3_000 });
    dispatchWheel(belowMinimum.canvas, { deltaY: -10, ctrlKey: true });
    expect(belowMinimum.getInterval()).toEqual({ start: 0, end: 3_000 });

    dispatchWheel(belowMinimum.canvas, { deltaY: 10, ctrlKey: true });
    expect(
      belowMinimum.getInterval().end - belowMinimum.getInterval().start,
    ).toBe(3_450);
  });

  it("keeps zoomed ranges within the supported Date timestamp range", () => {
    const maxTimestamp = 8_640_000_000_000_000;
    const initialInterval = {
      start: maxTimestamp - 100_000,
      end: maxTimestamp - 1,
    };
    const zoomOut = setup(
      ZoomMode.DEFAULT,
      {},
      initialInterval,
      {},
      () => maxTimestamp - 50_000,
    );

    dispatchWheel(zoomOut.canvas, { deltaY: 10, ctrlKey: true });

    expect(zoomOut.getInterval().start).toBeGreaterThanOrEqual(-maxTimestamp);
    expect(zoomOut.getInterval().end).toBeLessThanOrEqual(maxTimestamp);
    expect(Number.isFinite(new Date(zoomOut.getInterval().start).getTime())).toBe(
      true,
    );
    expect(Number.isFinite(new Date(zoomOut.getInterval().end).getTime())).toBe(
      true,
    );
  });

  it("normalizes a maximum range below the minimum range", () => {
    const zoomIn = setup(
      ZoomMode.DEFAULT,
      {},
      { start: 0, end: 3_000 },
      { maxRange: 1_000 },
      () => 1_500,
    );

    dispatchWheel(zoomIn.canvas, { deltaY: -10, ctrlKey: true });

    expect(zoomIn.getInterval().end - zoomIn.getInterval().start).toBe(2_700);
  });
});
