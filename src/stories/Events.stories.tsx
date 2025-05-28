import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  baseTimelineConfig,
  customRendererConfig,
  endlessTimelineConfig,
} from "./configs";
import { defaultViewConfig } from "../constants/options";
import { StoryWrapper } from "./StoryWrapper";
import { TimelineSettings, ViewConfiguration } from "../types";

type ViewConfigurationControls = {
  [K in keyof ViewConfiguration as `viewConfiguration.${K}`]: ViewConfiguration[K];
};

type SettingsControls = {
  [K in keyof TimelineSettings as `settings.${K}`]: TimelineSettings[K];
};

type StoryProps = SettingsControls & ViewConfigurationControls;

const meta = {
  title: "Timeline/Events",
  component: StoryWrapper as React.ComponentType<StoryProps>,
  argTypes: {
    "settings.start": {
      control: {
        type: "number",
      },
      description: "Start timestamp of the timeline",
      table: {
        category: "settings",
      },
    },
    "settings.end": {
      control: {
        type: "number",
      },
      description: "End timestamp of the timeline",
      table: {
        category: "settings",
      },
    },
    "settings.axes": {
      control: {
        type: "object",
      },
      description: "Timeline axes configuration",
      table: {
        category: "settings",
        type: {
          summary: "TimelineAxis[]",
          detail: JSON.stringify(baseTimelineConfig.settings.axes, null, 2),
        },
      },
    },
    "settings.events": {
      control: {
        type: "object",
      },
      description: "Timeline events configuration",
      table: {
        category: "settings",
        type: {
          summary: "TimelineEvent[]",
          detail: JSON.stringify(baseTimelineConfig.settings.events, null, 2),
        },
      },
    },
    "viewConfiguration.hideRuler": {
      control: {
        type: "boolean",
      },
      description: "Whether to hide the ruler",
      table: {
        category: "viewConfiguration",
      },
    },
    "viewConfiguration.ruler": {
      control: {
        type: "object",
      },
      description: "Ruler view options",
      table: {
        category: "viewConfiguration",
        type: {
          summary: "RulerViewOptions",
          detail: JSON.stringify(defaultViewConfig.ruler, null, 2),
        },
      },
    },
    "viewConfiguration.grid": {
      control: {
        type: "object",
      },
      description: "Grid view options",
      table: {
        category: "viewConfiguration",
        type: {
          summary: "GridViewOptions",
          detail: JSON.stringify(defaultViewConfig.grid, null, 2),
        },
      },
    },
    "viewConfiguration.axes": {
      control: {
        type: "object",
      },
      description: "Axes view options",
      table: {
        category: "viewConfiguration",
        type: {
          summary: "AxesViewOptions",
          detail: JSON.stringify(defaultViewConfig.axes, null, 2),
        },
      },
    },
    "viewConfiguration.events": {
      control: {
        type: "object",
      },
      description: "Events view options",
      table: {
        category: "viewConfiguration",
        type: {
          summary: "EnetsViewOptions",
          detail: JSON.stringify(defaultViewConfig.events, null, 2),
        },
      },
    },
    "viewConfiguration.markers": {
      control: {
        type: "object",
      },
      description: "Markers view options",
      table: {
        category: "viewConfiguration",
        type: {
          summary: "MarkerViewOptions",
          detail: JSON.stringify(defaultViewConfig.markers, null, 2),
        },
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100%", height: "400px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<StoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

const defaultViewConfigArgs: ViewConfigurationControls = {
  "viewConfiguration.hideRuler": defaultViewConfig.hideRuler,
  "viewConfiguration.ruler": defaultViewConfig.ruler,
  "viewConfiguration.grid": defaultViewConfig.grid,
  "viewConfiguration.axes": defaultViewConfig.axes,
  "viewConfiguration.events": defaultViewConfig.events,
  "viewConfiguration.markers": defaultViewConfig.markers,
};

export const Basic: Story = {
  args: {
    "settings.start": baseTimelineConfig.settings.start,
    "settings.end": baseTimelineConfig.settings.end,
    "settings.axes": baseTimelineConfig.settings.axes,
    "settings.events": baseTimelineConfig.settings.events,
    ...defaultViewConfigArgs,
  },
  parameters: {
    storyKey: "basic",
    docs: {
      description: {
        story: "Basic timeline configuration with regular events",
      },
    },
  },
};

export const EndlessTimelines: Story = {
  args: {
    "settings.start": endlessTimelineConfig.settings.start,
    "settings.end": endlessTimelineConfig.settings.end,
    "settings.axes": endlessTimelineConfig.settings.axes,
    "settings.events": endlessTimelineConfig.settings.events,
    ...defaultViewConfigArgs,
  },
  parameters: {
    storyKey: "endless",
    docs: {
      description: {
        story: "Demonstration of a timeline with infinite scrolling",
      },
    },
  },
};

export const CustomRenderer: Story = {
  args: {
    "settings.start": customRendererConfig.settings.start,
    "settings.end": customRendererConfig.settings.end,
    "settings.axes": customRendererConfig.settings.axes,
    "settings.events": customRendererConfig.settings.events,
    ...defaultViewConfigArgs,
  },
  parameters: {
    storyKey: "custom renderer",
    docs: {
      description: {
        story: "Demonstration of a timeline with custom renderer",
      },
    },
  },
};
