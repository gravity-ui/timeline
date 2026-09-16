import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ZoomMode } from "../enums";
import type {
  CameraInteractionAction,
  CameraInteractions,
  TimeLineConfig,
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
  ZoomSensitivity,
} from "../types";
import { TimelineCanvas } from "../react-components/TimelineCanvas";
import { useTimeline } from "../react-components/hooks/useTimeline";
import { useTimelineEvent } from "../react-components/hooks/useTimelineEvent";
import { baseTimelineConfig } from "./configs/events";

const meta = {
  title: "Components/TimelineCanvas",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const interactionActions: CameraInteractionAction[] = [
  "zoom",
  "pan",
  "pass-through",
];

const interactionNames: Record<keyof CameraInteractions, string> = {
  verticalWheel: "Vertical wheel",
  horizontalWheel: "Horizontal wheel",
  pinch: "Pinch (Ctrl+wheel)",
};

const DAY = 24 * 60 * 60 * 1000;
const RANGE_DEMO_START = Date.UTC(2026, 0, 1);
const RANGE_DEMO_END = RANGE_DEMO_START + 120 * DAY;

type RangeLimitMode = "unlimited" | "twoMonths" | "oneYear";

const maxRanges: Record<RangeLimitMode, number | undefined> = {
  unlimited: undefined,
  twoMonths: 60 * DAY,
  oneYear: 365 * DAY,
};

const rangeLimitLabels: Record<RangeLimitMode, string> = {
  unlimited: "No maximum",
  twoMonths: "60 days",
  oneYear: "1 year",
};

const SYNCED_RULER_HEIGHT = 41;
const syncedCamera = {
  interactions: {
    verticalWheel: "pass-through" as const,
    horizontalWheel: "pan" as const,
    pinch: "zoom" as const,
  },
};

const SyncedTimelinesExample = () => {
  const rulerConfig = useMemo<
    TimeLineConfig<TimelineEvent, TimelineMarker, TimelineSection>
  >(
    () => ({
      settings: {
        start: baseTimelineConfig.settings.start,
        end: baseTimelineConfig.settings.end,
        axes: [],
        events: [],
        markers: [],
        sections: [],
      },
      viewConfiguration: {
        ruler: { height: SYNCED_RULER_HEIGHT },
        camera: { ...syncedCamera },
      },
    }),
    [],
  );
  const contentConfig = useMemo<
    TimeLineConfig<TimelineEvent, TimelineMarker, TimelineSection>
  >(
    () => ({
      settings: {
        ...baseTimelineConfig.settings,
        axes: baseTimelineConfig.settings.axes.map((axis) => ({ ...axis })),
        events: baseTimelineConfig.settings.events.map((event) => ({
          ...event,
        })),
        markers: [],
        sections: [],
      },
      viewConfiguration: {
        hideRuler: true,
        camera: { ...syncedCamera },
      },
    }),
    [],
  );
  const { timeline: rulerTimeline } = useTimeline(rulerConfig);
  const { timeline: contentTimeline } = useTimeline(contentConfig);
  const syncRuler = useCallback(
    ({ from, to }: { from: number; to: number }) =>
      rulerTimeline.api.setRange(from, to),
    [rulerTimeline],
  );
  const syncContent = useCallback(
    ({ from, to }: { from: number; to: number }) =>
      contentTimeline.api.setRange(from, to),
    [contentTimeline],
  );

  useTimelineEvent(contentTimeline, "on-range-change", syncRuler);
  useTimelineEvent(rulerTimeline, "on-range-change", syncContent);

  return (
    <div style={{ padding: 16 }}>
      <p style={{ marginTop: 0 }}>
        The ruler is a separate sticky timeline. Horizontal wheel and Ctrl+wheel
        synchronize both canvases immediately; vertical wheel scrolls this
        container.
      </p>
      <button
        onClick={() =>
          contentTimeline.api.setRange(
            contentConfig.settings.start,
            contentConfig.settings.end,
          )
        }
      >
        Reset visible range
      </button>
      <div
        style={{
          width: 720,
          height: 320,
          marginTop: 16,
          overflow: "auto",
          border: "1px solid #999",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            height: SYNCED_RULER_HEIGHT,
            background: "#fff",
          }}
        >
          <TimelineCanvas timeline={rulerTimeline} />
        </div>
        <div style={{ height: 720 }}>
          <TimelineCanvas timeline={contentTimeline} />
        </div>
      </div>
    </div>
  );
};

export const SyncedTimelines: Story = {
  name: "Synced timelines",
  parameters: {
    docs: {
      description: {
        story:
          "A sticky ruler and event timeline synchronized through on-range-change. The reset button updates only the event timeline; the ruler follows through the event.",
      },
    },
  },
  render: () => <SyncedTimelinesExample />,
};

const CanvasInteractionExample = () => {
  const [zoom, setZoom] = useState(ZoomMode.DEFAULT);
  const [interactions, setInteractions] = useState<CameraInteractions>({
    verticalWheel: "pass-through",
  });
  const [zoomSensitivity, setZoomSensitivity] = useState<
    Required<ZoomSensitivity>
  >({ in: 1, out: 1 });
  const [tabIndex, setTabIndex] = useState(0);
  const config = useMemo(
    () => ({
      ...baseTimelineConfig,
      viewConfiguration: { camera: { zoom, interactions, zoomSensitivity } },
    }),
    [interactions, zoom, zoomSensitivity],
  );

  const setInteraction = (
    interaction: keyof CameraInteractions,
    value: string,
  ) => {
    setInteractions((current) => {
      const next = { ...current };

      if (value === "preset") {
        delete next[interaction];
      } else {
        next[interaction] = value as CameraInteractionAction;
      }

      return next;
    });
  };
  const { timeline } = useTimeline(config);

  return (
    <div style={{ padding: 16 }}>
      <p style={{ marginTop: 0 }}>
        Try vertical scrolling inside the bordered container: the initial
        configuration passes it to the parent while keeping horizontal pan and
        Ctrl+wheel zoom on the timeline.
      </p>
      <label>
        Zoom mode:{" "}
        <select
          value={zoom}
          onChange={(event) => setZoom(event.target.value as ZoomMode)}
        >
          {Object.values(ZoomMode).map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
      </label>
      {(Object.keys(interactionNames) as Array<keyof CameraInteractions>).map(
        (interaction) => (
          <label key={interaction} style={{ marginLeft: 16 }}>
            {interactionNames[interaction]}:{" "}
            <select
              value={interactions[interaction] ?? "preset"}
              onChange={(event) =>
                setInteraction(interaction, event.target.value)
              }
            >
              <option value="preset">Use zoom preset</option>
              {interactionActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </label>
        ),
      )}
      <div style={{ marginTop: 16 }}>
        Zoom sensitivity (1 is default; lower is gentler):
        {(["in", "out"] as const).map((direction) => (
          <label key={direction} style={{ marginLeft: 16 }}>
            Zoom {direction}:{" "}
            <input
              type="number"
              min="0"
              step="0.1"
              value={zoomSensitivity[direction]}
              onChange={(event) => {
                const value = Number(event.target.value);
                setZoomSensitivity((current) => ({
                  ...current,
                  [direction]: Number.isFinite(value) && value >= 0 ? value : 1,
                }));
              }}
            />
          </label>
        ))}
        <button
          style={{ marginLeft: 16 }}
          onClick={() => setZoomSensitivity({ in: 1, out: 1 })}
        >
          Use defaults
        </button>
      </div>
      <label style={{ marginLeft: 16 }}>
        <input
          type="checkbox"
          checked={tabIndex === -1}
          onChange={(event) => setTabIndex(event.target.checked ? -1 : 0)}
        />
        Exclude canvas from Tab navigation
      </label>
      <button style={{ marginLeft: 16 }}>Button before canvas</button>
      <div
        tabIndex={-1}
        style={{
          width: 480,
          height: 240,
          marginTop: 16,
          overflow: "auto",
          border: "1px solid #999",
        }}
      >
        <div style={{ width: 800, height: 400, padding: 24 }}>
          <div style={{ width: 700, height: 200 }}>
            <TimelineCanvas timeline={timeline} tabIndex={tabIndex} />
          </div>
        </div>
      </div>
      <button style={{ marginTop: 16 }}>Button after canvas</button>
    </div>
  );
};

export const InteractionAndFocus: Story = {
  name: "Camera interactions and focus",
  parameters: {
    docs: {
      description: {
        story:
          "Configure each wheel gesture independently. Zoom sensitivity applies to every gesture configured as zoom: 1 keeps the default step, while lower values make wheel and Ctrl+wheel/trackpad pinch gentler. Use maxRange in the range limits example to bound zoom-out distance.",
      },
    },
  },
  render: () => <CanvasInteractionExample />,
};

const ZoomRangeLimitsExample = () => {
  const [limitMode, setLimitMode] = useState<RangeLimitMode>("unlimited");
  const [currentRange, setCurrentRange] = useState({
    from: RANGE_DEMO_START,
    to: RANGE_DEMO_END,
  });
  const maxRange = maxRanges[limitMode];
  const config = useMemo(
    () => ({
      ...baseTimelineConfig,
      settings: {
        ...baseTimelineConfig.settings,
        start: RANGE_DEMO_START,
        end: RANGE_DEMO_END,
        events: baseTimelineConfig.settings.events.map((event, index) => ({
          ...event,
          from: RANGE_DEMO_START + (index * 24 + 8) * DAY,
          to: RANGE_DEMO_START + (index * 24 + 16) * DAY,
        })),
      },
      viewConfiguration: {
        camera: {
          minRange: 5_000,
          maxRange,
        },
      },
    }),
    [maxRange],
  );
  const { timeline } = useTimeline(config);
  const handleCameraChange = useCallback(
    ({ from, to }: { from: number; to: number }) =>
      setCurrentRange({ from, to }),
    [],
  );

  useTimelineEvent(timeline, "on-camera-change", handleCameraChange);

  useEffect(() => {
    setCurrentRange({ from: RANGE_DEMO_START, to: RANGE_DEMO_END });
  }, [limitMode]);

  const visibleDays = Math.round((currentRange.to - currentRange.from) / DAY);

  return (
    <div style={{ padding: 16 }}>
      <p style={{ marginTop: 0 }}>
        The timeline starts with a 120-day range. Use Ctrl+wheel over the canvas
        to zoom. With no maximum, both zoom directions work beyond 60 days. A
        configured maximum only restricts zoom-out from ranges that are already
        within the limit.
      </p>
      <label>
        Maximum range:{" "}
        <select
          value={limitMode}
          onChange={(event) =>
            setLimitMode(event.target.value as RangeLimitMode)
          }
        >
          {(Object.keys(maxRanges) as RangeLimitMode[]).map((mode) => (
            <option key={mode} value={mode}>
              {rangeLimitLabels[mode]}
            </option>
          ))}
        </select>
      </label>
      <span style={{ marginLeft: 16 }}>Visible range: {visibleDays} days</span>
      <div style={{ width: 720, height: 240, marginTop: 16 }}>
        <TimelineCanvas timeline={timeline} />
      </div>
    </div>
  );
};

export const ZoomRangeLimits: Story = {
  name: "Zoom range limits",
  parameters: {
    docs: {
      description: {
        story:
          "Explore the 5-second minimum range, unrestricted default zoom-out, and optional maximum range in milliseconds.",
      },
    },
  },
  render: () => <ZoomRangeLimitsExample />,
};
