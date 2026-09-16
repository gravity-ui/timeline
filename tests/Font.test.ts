import { describe, expect, it, vi } from "vitest";
import { CanvasApi } from "../src/CanvasApi";
import { Events } from "../src/components/Events";
import { DefaultMarkerRenderer } from "../src/components/Markers/DefaultMarkerRenderer";
import { Markers } from "../src/components/Markers/Markers";
import { Ruler } from "../src/components/Ruler";
import { resolveCanvasFont } from "../src/helpers/font";

const canvas = document.createElement("canvas");

describe("canvas font resolution", () => {
  it("keeps regular canvas font shorthands unchanged", () => {
    expect(resolveCanvasFont("600 12px Inter, sans-serif", canvas)).toBe(
      "600 12px Inter, sans-serif",
    );
  });

  it("resolves nested CSS variables from the canvas context", () => {
    const fonts: Record<string, string> = {
      "--g-text-caption-2-font": "var(--app-caption-font)",
      "--app-caption-font": "400 11px Inter, sans-serif",
    };
    const getComputedStyle = vi.spyOn(window, "getComputedStyle").mockReturnValue({
      font: "13px Arial",
      getPropertyValue: (name: string) => fonts[name] || "",
    } as CSSStyleDeclaration);

    expect(
      resolveCanvasFont("var(--g-text-caption-2-font)", canvas),
    ).toBe("400 11px Inter, sans-serif");

    getComputedStyle.mockRestore();
  });

  it("uses the CSS fallback, safe fallback, and detects variable cycles", () => {
    const getComputedStyle = vi.spyOn(window, "getComputedStyle").mockReturnValue({
      font: "13px Arial",
      getPropertyValue: (name: string) =>
        name === "--first" ? "var(--second)" : name === "--second" ? "var(--first)" : "",
    } as CSSStyleDeclaration);

    expect(resolveCanvasFont("var(--missing, 12px serif)", canvas)).toBe(
      "12px serif",
    );
    expect(resolveCanvasFont("var(--missing)", canvas, "9px sans-serif")).toBe(
      "9px sans-serif",
    );
    expect(resolveCanvasFont("var(--first)", canvas, "9px sans-serif")).toBe(
      "9px sans-serif",
    );

    getComputedStyle.mockRestore();
  });

  it("resolves inherit from the canvas computed font and falls back when absent", () => {
    const getComputedStyle = vi.spyOn(window, "getComputedStyle").mockReturnValue({
      font: "600 13px Inter, sans-serif",
      getPropertyValue: () => "",
    } as CSSStyleDeclaration);

    expect(resolveCanvasFont("inherit", canvas)).toBe(
      "600 13px Inter, sans-serif",
    );

    getComputedStyle.mockReturnValue({
      font: "",
      getPropertyValue: () => "",
    } as CSSStyleDeclaration);
    expect(resolveCanvasFont("inherit", canvas, "10px serif")).toBe("10px serif");

    getComputedStyle.mockRestore();
  });

  it("caches values until the next render", () => {
    const context = { globalAlpha: 1 } as CanvasRenderingContext2D;
    vi.spyOn(canvas, "getContext").mockReturnValue(context);
    const getComputedStyle = vi.spyOn(window, "getComputedStyle").mockReturnValue({
      font: "400 11px Inter, sans-serif",
      getPropertyValue: () => "",
    } as CSSStyleDeclaration);
    const api = new CanvasApi({ canvas } as never);

    expect(api.resolveFont("inherit")).toBe("400 11px Inter, sans-serif");
    expect(api.resolveFont("inherit")).toBe("400 11px Inter, sans-serif");
    expect(getComputedStyle).toHaveBeenCalledOnce();

    api.rerender(false);
    api.resolveFont("inherit");
    expect(getComputedStyle).toHaveBeenCalledTimes(2);

    getComputedStyle.mockRestore();
  });

  it("uses resolved fonts in built-in ruler, events, and marker rendering", () => {
    const ctx = {
      canvas: { width: 200, height: 100 },
      font: "",
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      lineJoin: "",
      miterLimit: 0,
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      translate: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    const resolveFont = vi.fn(() => "400 11px Inter, sans-serif");
    const viewConfiguration = {
      ruler: {
        height: 40,
        font: "var(--g-text-caption-2-font)",
        color: {
          background: "transparent",
          borderColor: "transparent",
          primaryLevel: "black",
          secondaryLevel: "gray",
          textOutlineColor: "white",
          rulerWeekendColor: "red",
        },
      },
      events: { font: "var(--g-text-caption-2-font)" },
      markers: {
        font: "var(--g-text-caption-2-font)",
        groupColor: "orange",
        groupColorHover: "red",
      },
    };
    const canvas = document.createElement("canvas");
    const api = {
      ctx,
      canvas,
      width: 200,
      useStaticTransform: vi.fn(),
      useScrollTransform: vi.fn(),
      resolveFont,
      resolveColor: (value: string) => value,
      getViewConfiguration: () => viewConfiguration,
      getTimelineSettings: () => ({ customLevelLabels: () => [] }),
      getInterval: () => ({ start: 0, end: 10 }),
      getComponent: () => ({ getAxesById: () => ({}) }),
      getRulerHeight: () => 0,
      getCameraPosition: () => ({ y0: 0, y1: 100 }),
      timeToPosition: (value: number) => value,
    };

    new Ruler(api as never).render();
    expect(ctx.font).toBe("400 11px Inter, sans-serif");

    new Events(api as never).render();
    expect(ctx.font).toBe("400 11px Inter, sans-serif");

    new DefaultMarkerRenderer().render({
      ctx,
      marker: { time: 10, label: "Marker", color: "blue" },
      isSelected: false,
      isHovered: false,
      markerPosition: 10,
      viewConfiguration,
      lastRenderedLabelPosition: { top: Infinity, bottom: Infinity },
      getLabelSize: () => ({ width: 20, height: 10 }),
      resolveFont,
    });
    expect(ctx.font).toBe("400 11px Inter, sans-serif");
    expect(resolveFont).toHaveBeenCalledWith("var(--g-text-caption-2-font)");
  });

  it("does not reuse marker label measurements for a different font", () => {
    const measureText = vi.fn(() => ({
      width: 10,
      actualBoundingBoxAscent: 7,
      actualBoundingBoxDescent: 3,
    }));
    const ctx = {
      font: "10px sans-serif",
      measureText,
    } as unknown as CanvasRenderingContext2D;
    const api = {
      ctx,
      canvas: document.createElement("canvas"),
    };
    class TestMarkers extends Markers {
      public measure(text: string) {
        return this.getLabelSize(text);
      }
    }
    const markers = new TestMarkers(api as never);

    markers.measure("Marker");
    markers.measure("Marker");
    ctx.font = "400 11px Inter, sans-serif";
    markers.measure("Marker");

    expect(measureText).toHaveBeenCalledTimes(2);
  });
});
