import React, { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ZoomMode } from "../enums";
import type { CameraInteractionAction, CameraInteractions } from "../types";
import { TimelineCanvas } from "../react-components/TimelineCanvas";
import { useTimeline } from "../react-components/hooks/useTimeline";
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

const CanvasInteractionExample = () => {
  const [zoom, setZoom] = useState(ZoomMode.DEFAULT);
  const [interactions, setInteractions] = useState<CameraInteractions>({
    verticalWheel: "pass-through",
  });
  const [tabIndex, setTabIndex] = useState(0);
  const config = useMemo(
    () => ({
      ...baseTimelineConfig,
      viewConfiguration: { camera: { zoom, interactions } },
    }),
    [interactions, zoom],
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
          "Configure each wheel gesture independently. The initial configuration demonstrates vertical scroll pass-through with horizontal pan and trackpad pinch zoom.",
      },
    },
  },
  render: () => <CanvasInteractionExample />,
};
