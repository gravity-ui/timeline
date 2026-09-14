import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeProvider } from "@gravity-ui/uikit";
import "@gravity-ui/uikit/styles/fonts.css";
import "@gravity-ui/uikit/styles/styles.css";
import { GravityTimelineCanvas } from "../react-uikit";
import { useTimeline } from "../react-components/hooks/useTimeline";
import {
  TimeLineConfig,
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
} from "../types";

const START = 1739537126347;
const SECOND = 1000;

const gravityColorsConfig: TimeLineConfig<
  TimelineEvent,
  TimelineMarker,
  TimelineSection
> = {
  settings: {
    start: START,
    end: START + 60 * SECOND,
    axes: [
      {
        id: "main",
        tracksCount: 3,
        top: 0,
        height: 36,
      },
    ],
    events: [
      {
        id: "success",
        axisId: "main",
        trackIndex: 0,
        from: START + 5 * SECOND,
        to: START + 24 * SECOND,
        color: "var(--g-color-base-positive-medium)",
        hoverColor: "var(--g-color-base-positive-medium-hover)",
        selectedColor: "var(--g-color-base-positive-heavy)",
      },
      {
        id: "warning",
        axisId: "main",
        trackIndex: 1,
        from: START + 20 * SECOND,
        to: START + 42 * SECOND,
        color: "var(--g-color-base-warning-medium)",
        hoverColor: "var(--g-color-base-warning-medium-hover)",
        selectedColor: "var(--g-color-base-warning-heavy)",
      },
      {
        id: "danger",
        axisId: "main",
        trackIndex: 2,
        from: START + 38 * SECOND,
        to: START + 55 * SECOND,
        color: "var(--g-color-base-danger-medium)",
        hoverColor: "var(--g-color-base-danger-medium-hover)",
        selectedColor: "var(--g-color-base-danger-heavy)",
      },
    ],
    markers: [
      {
        time: START + 30 * SECOND,
        label: "Deploy",
        color: "var(--g-color-line-brand)",
        hoverColor: "var(--g-color-base-brand-hover)",
        activeColor: "var(--g-color-base-brand)",
        labelColor: "var(--g-color-text-brand-contrast)",
        lineWidth: 2,
      },
    ],
    sections: [
      {
        id: "maintenance",
        from: START + 12 * SECOND,
        to: START + 32 * SECOND,
        color: "var(--g-color-base-info-light)",
        hoverColor: "var(--g-color-base-info-light-hover)",
      },
    ],
  },
  viewConfiguration: {
    ruler: {
      color: {
        background: "var(--g-color-base-background)",
        primaryLevel: "var(--g-color-text-primary)",
        secondaryLevel: "var(--g-color-text-secondary)",
        textOutlineColor: "var(--g-color-base-background)",
        borderColor: "var(--g-color-line-generic)",
        rulerWeekendColor: "var(--g-color-text-danger)",
      },
    },
    grid: {
      color: {
        primaryMarkColor: "var(--g-color-line-generic-accent)",
        secondaryMarkColor: "var(--g-color-line-generic)",
        boundaryMarkColor: "var(--g-color-line-brand)",
      },
    },
    axes: {
      color: {
        line: "var(--g-color-line-generic)",
      },
    },
    markers: {
      groupColor: "var(--g-color-base-brand)",
      groupColorHover: "var(--g-color-base-brand-hover)",
    },
  },
};

type GravityColorsStoryProps = {
  theme: "light" | "dark";
};

const GravityColorsExample = ({ theme }: GravityColorsStoryProps) => {
  const { timeline } = useTimeline(gravityColorsConfig);

  return (
    <ThemeProvider scoped theme={theme}>
      <div
        style={{
          boxSizing: "border-box",
          width: "100%",
          height: 320,
          padding: "var(--g-spacing-4)",
          background: "var(--g-color-base-background)",
        }}
      >
        <GravityTimelineCanvas timeline={timeline} />
      </div>
    </ThemeProvider>
  );
};

const meta = {
  title: "Components/GravityTimelineCanvas",
  component: GravityColorsExample,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "GravityTimelineCanvas resolves semantic Gravity UI color tokens and redraws the timeline when the effective theme changes.",
      },
    },
  },
  args: {
    theme: "light",
  },
  argTypes: {
    theme: {
      control: "inline-radio",
      options: ["light", "dark"],
    },
  },
} satisfies Meta<typeof GravityColorsExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SemanticColors: Story = {};
