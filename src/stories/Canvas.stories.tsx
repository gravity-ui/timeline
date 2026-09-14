import React, { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ZoomMode } from "../enums";
import { TimelineCanvas } from "../react-components/TimelineCanvas";
import { useTimeline } from "../react-components/hooks/useTimeline";
import { baseTimelineConfig } from "./configs/events";

const meta = {
  title: "Components/TimelineCanvas",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const CanvasInteractionExample = () => {
  const [zoom, setZoom] = useState(ZoomMode.NONE);
  const [tabIndex, setTabIndex] = useState(0);
  const config = useMemo(
    () => ({
      ...baseTimelineConfig,
      viewConfiguration: { camera: { zoom } },
    }),
    [zoom],
  );
  const { timeline } = useTimeline(config);

  return (
    <div style={{ padding: 16 }}>
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
  render: () => <CanvasInteractionExample />,
};
