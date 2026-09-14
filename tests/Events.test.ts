import { describe, expect, it, vi } from "vitest";
import { Events } from "../src/components/Events";

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
