import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimelineState } from "../src/enums";

let themeValue = "light";

vi.mock("@gravity-ui/uikit", () => ({
  useThemeValue: () => themeValue,
}));

import { GravityTimelineCanvas } from "../src/react-uikit";

describe("GravityTimelineCanvas", () => {
  it("rerenders an existing timeline when the effective theme changes", () => {
    const timeline = {
      state: TimelineState.READY,
      api: { rerender: vi.fn() },
      init: vi.fn(),
      destroy: vi.fn(),
    };
    const { rerender } = render(
      <GravityTimelineCanvas timeline={timeline as never} />,
    );

    expect(timeline.init).toHaveBeenCalledOnce();
    timeline.api.rerender.mockClear();
    themeValue = "dark";
    rerender(<GravityTimelineCanvas timeline={timeline as never} />);

    expect(timeline.api.rerender).toHaveBeenCalledOnce();
    expect(timeline.init).toHaveBeenCalledOnce();
  });
});
