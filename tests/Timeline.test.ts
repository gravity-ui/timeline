import { describe, expect, it, vi } from "vitest";
import { Timeline } from "../src/Timeline";
import { TimelineState, ZoomMode } from "../src/enums";
import { TimelineEvent } from "../src/types";

describe("Timeline lifecycle", () => {
  it("defaults camera zoom while preserving partial interaction overrides", () => {
    const timeline = new Timeline({
      settings: {
        start: 0,
        end: 100_000,
        axes: [],
        events: [],
      },
      viewConfiguration: {
        camera: {
          interactions: { verticalWheel: "pass-through" },
        },
      },
    });

    expect(timeline.viewConfiguration.camera).toEqual({
      zoom: ZoomMode.DEFAULT,
      interactions: { verticalWheel: "pass-through" },
    });
  });

  it("leaves the ready state before emitting on-destroy", () => {
    const timeline = Object.create(
      Timeline.prototype,
    ) as Timeline<TimelineEvent>;
    const controllerDestroy = vi.fn();
    const apiDestroy = vi.fn();
    let stateDuringDestroy: TimelineState | undefined;

    timeline.state = TimelineState.READY;
    timeline.eventEmitter = new EventTarget();
    (timeline as unknown as { controller: { destroy: () => void } }).controller = {
      destroy: controllerDestroy,
    };
    (timeline as unknown as { api: { destroy: () => void } }).api = {
      destroy: apiDestroy,
    };
    timeline.on("on-destroy", () => {
      stateDuringDestroy = timeline.state;
    });

    timeline.destroy();

    expect(stateDuringDestroy).toBe(TimelineState.INIT);
    expect(controllerDestroy).toHaveBeenCalledOnce();
    expect(apiDestroy).toHaveBeenCalledOnce();
  });
});
