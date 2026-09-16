import { describe, expect, it, vi } from "vitest";
import { CanvasApi } from "../src/CanvasApi";
import { TimelineEvent, TimelineMarker, TimelineSection } from "../src/types";

type TestApi = CanvasApi<TimelineEvent, TimelineMarker, TimelineSection>;

const createApi = (start = 0, end = 100) => {
  const eventEmitter = new EventTarget();
  const emit = vi.fn((type: string, detail: unknown) => {
    eventEmitter.dispatchEvent(new CustomEvent(type, { detail }));
  });
  const timeline = {
    settings: { start, end },
    emit,
  };
  const api = Object.create(CanvasApi.prototype) as TestApi;
  Object.assign(api, { timeline, rerender: vi.fn() });

  return {
    api,
    emit,
    eventEmitter,
    rerender: api.rerender as ReturnType<typeof vi.fn>,
  };
};

describe("CanvasApi.setRange", () => {
  it("renders and immediately emits the new range", () => {
    const { api, emit, rerender } = createApi();

    api.setRange(10, 110);

    expect(rerender).toHaveBeenCalledOnce();
    expect(emit).toHaveBeenCalledWith("on-range-change", {
      from: 10,
      to: 110,
    });
    expect(emit).not.toHaveBeenCalledWith(
      "on-camera-change",
      expect.anything(),
    );
  });

  it("renders but does not emit when the range is unchanged", () => {
    const { api, emit, rerender } = createApi();

    api.setRange(0, 100);

    expect(rerender).toHaveBeenCalledOnce();
    expect(emit).not.toHaveBeenCalled();
  });

  it("synchronizes two timelines without an event loop", () => {
    const first = createApi();
    const second = createApi();
    first.eventEmitter.addEventListener("on-range-change", (event) => {
      const { from, to } = (event as CustomEvent<{ from: number; to: number }>)
        .detail;
      second.api.setRange(from, to);
    });
    second.eventEmitter.addEventListener("on-range-change", (event) => {
      const { from, to } = (event as CustomEvent<{ from: number; to: number }>)
        .detail;
      first.api.setRange(from, to);
    });

    first.api.setRange(10, 110);

    expect(first.emit).toHaveBeenCalledOnce();
    expect(second.emit).toHaveBeenCalledOnce();
  });
});
