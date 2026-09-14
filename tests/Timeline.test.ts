import { describe, expect, it, vi } from "vitest";
import { Timeline } from "../src/Timeline";
import { TimelineState } from "../src/enums";
import { TimelineEvent } from "../src/types";

describe("Timeline lifecycle", () => {
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
