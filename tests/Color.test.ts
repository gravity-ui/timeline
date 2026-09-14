import { describe, expect, it, vi } from "vitest";
import { CanvasApi } from "../src/CanvasApi";
import { resolveCanvasColor } from "../src/helpers/color";

const canvas = document.createElement("canvas");

describe("canvas color resolution", () => {
  it("keeps regular canvas colors unchanged", () => {
    expect(resolveCanvasColor("rgba(1, 2, 3, 0.5)", canvas)).toBe(
      "rgba(1, 2, 3, 0.5)",
    );
  });

  it("resolves nested CSS variables from the canvas context", () => {
    const colors: Record<string, string> = {
      "--g-color-base-positive-medium":
        "var(--g-color-private-green-600-solid)",
      "--g-color-private-green-600-solid": "rgb(0, 128, 0)",
    };
    const getPropertyValue = vi.fn((name: string) => colors[name] || "");
    const getComputedStyle = vi
      .spyOn(window, "getComputedStyle")
      .mockReturnValue({ getPropertyValue } as CSSStyleDeclaration);

    expect(
      resolveCanvasColor("var(--g-color-base-positive-medium)", canvas),
    ).toBe("rgb(0, 128, 0)");
    expect(getComputedStyle).toHaveBeenCalledWith(canvas);

    getComputedStyle.mockRestore();
  });

  it("uses the CSS fallback or safe fallback for an unknown variable", () => {
    const getComputedStyle = vi
      .spyOn(window, "getComputedStyle")
      .mockReturnValue({ getPropertyValue: () => "" } as CSSStyleDeclaration);

    expect(resolveCanvasColor("var(--missing, red)", canvas)).toBe("red");
    expect(resolveCanvasColor("var(--missing)", canvas, "blue")).toBe("blue");

    getComputedStyle.mockRestore();
  });

  it("caches values until the next render", () => {
    const context = { globalAlpha: 1 } as CanvasRenderingContext2D;
    vi.spyOn(canvas, "getContext").mockReturnValue(context);
    const getPropertyValue = vi.fn(() => "rgb(1, 2, 3)");
    const getComputedStyle = vi
      .spyOn(window, "getComputedStyle")
      .mockReturnValue({ getPropertyValue } as CSSStyleDeclaration);
    const api = new CanvasApi({ canvas } as never);

    expect(api.resolveColor("var(--token)")).toBe("rgb(1, 2, 3)");
    expect(api.resolveColor("var(--token)")).toBe("rgb(1, 2, 3)");
    expect(getPropertyValue).toHaveBeenCalledOnce();

    api.rerender(false);
    api.resolveColor("var(--token)");
    expect(getPropertyValue).toHaveBeenCalledTimes(2);

    getComputedStyle.mockRestore();
  });
});
