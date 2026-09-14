import { describe, expect, it, vi } from "vitest";
import { CanvasApi } from "../src/CanvasApi";
import { Axes } from "../src/components/Axes";
import { defaultViewConfig } from "../src/constants/options";
import { StrokeMode } from "../src/enums";
import {
  AxesLinePosition,
  TimelineAxis,
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
} from "../src/types";

type AxesApi = CanvasApi<
  TimelineEvent,
  TimelineMarker,
  TimelineSection
>;

const createAxes = (
  linePosition: AxesLinePosition | string = "center",
  camera = { y0: 0, y1: 200, x0: 0, x1: 200 },
) => {
  const ctx = {
    canvas: { width: 200 },
    setLineDash: vi.fn(),
    translate: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    strokeStyle: "",
    lineWidth: 0,
  };
  const api = {
    ctx,
    getViewConfiguration: () => ({
      axes: {
        ...defaultViewConfig.axes,
        linePosition,
      },
    }),
    useScrollTransform: vi.fn(),
    resolveColor: (color: string) => color,
    getRulerHeight: () => 0,
    getCameraPosition: () => camera,
  } as unknown as AxesApi;

  return { axes: new Axes(api), ctx };
};

const linePositions = (ctx: { moveTo: ReturnType<typeof vi.fn> }) =>
  ctx.moveTo.mock.calls.map(([, y]) => y);

describe("Axes", () => {
  const axis: TimelineAxis = {
    id: "main",
    top: 10,
    height: 20,
    tracksCount: 3,
  };

  it("defaults horizontal lines to track centers", () => {
    expect(defaultViewConfig.axes.linePosition).toBe("center");

    const { axes, ctx } = createAxes();
    axes.setAxes([axis]);

    expect(linePositions(ctx)).toEqual([20, 40, 60]);
  });

  it("draws a line after every track in between mode", () => {
    const { axes, ctx } = createAxes("between");
    axes.setAxes([axis]);

    expect(linePositions(ctx)).toEqual([30, 50, 70]);
  });

  it("draws the bottom boundary for a single track", () => {
    const { axes, ctx } = createAxes("between");
    axes.setAxes([{ ...axis, tracksCount: 1 }]);

    expect(linePositions(ctx)).toEqual([30]);
  });

  it("uses each axis position and track height", () => {
    const { axes, ctx } = createAxes("between");
    axes.setAxes([
      axis,
      { id: "secondary", top: 100, height: 30, tracksCount: 2 },
    ]);

    expect(linePositions(ctx)).toEqual([30, 50, 70, 130, 160]);
  });

  it("keeps track centers unchanged when lines are drawn between rows", () => {
    const { axes } = createAxes("between");

    expect(axes.getAxisTrackPosition(axis, 0)).toBe(20);
    expect(axes.getAxisTrackPosition(axis, 1)).toBe(40);
    expect(axes.getAxisTrackPosition(axis, 2)).toBe(60);
  });

  it("renders lines at visible camera boundaries only", () => {
    const { axes, ctx } = createAxes("between", {
      y0: 30,
      y1: 50,
      x0: 0,
      x1: 200,
    });
    axes.setAxes([axis]);

    expect(linePositions(ctx)).toEqual([30, 50]);
  });

  it("preserves visual styling in between mode", () => {
    const { axes, ctx } = createAxes("between");
    axes.strokeMode = StrokeMode.DASHED;
    axes.setAxes([axis]);

    expect(ctx.strokeStyle).toBe(defaultViewConfig.axes.color.line);
    expect(ctx.lineWidth).toBe(defaultViewConfig.axes.lineWidth);
    expect(ctx.setLineDash).toHaveBeenNthCalledWith(
      1,
      defaultViewConfig.axes.dashedLinePattern,
    );
    expect(ctx.setLineDash).toHaveBeenNthCalledWith(
      2,
      defaultViewConfig.axes.solidLinePattern,
    );
  });

  it("falls back to center lines for an unknown runtime value", () => {
    const { axes, ctx } = createAxes("unsupported");
    axes.setAxes([axis]);

    expect(linePositions(ctx)).toEqual([20, 40, 60]);
  });
});

describe("CanvasApi.setViewConfiguration", () => {
  it("updates the line position and re-renders", () => {
    const api = Object.create(CanvasApi.prototype) as AxesApi;
    const rerender = vi.fn();
    const timeline = { viewConfiguration: defaultViewConfig };

    (api as unknown as { timeline: typeof timeline }).timeline = timeline;
    api.rerender = rerender;

    api.setViewConfiguration({ axes: { linePosition: "between" } });

    expect(timeline.viewConfiguration.axes.linePosition).toBe("between");
    expect(rerender).toHaveBeenCalledOnce();
  });
});
