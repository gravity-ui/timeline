import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { baseTimelineConfig } from "./configs/events";
import {
  collapsedBaseConfig,
  markersBaseConfig,
  markersCustomRenderer,
  markersWithLabelsConfig,
} from "./configs/markers";
import { defaultViewConfig } from "../constants/options";
import { StoryWrapper } from "./StoryWrapper";
import {
  TimelineEvent,
  TimelineMarker,
  TimelineSettings,
  ViewConfiguration,
} from "../types";
import { ZoomMode } from "../enums";

type ViewConfigurationControls = {
  [K in keyof ViewConfiguration as `viewConfiguration.${K}`]: ViewConfiguration[K];
};

type SettingsControls = {
  [K in keyof TimelineSettings<
    TimelineEvent,
    TimelineMarker
  > as `settings.${K}`]: TimelineSettings<TimelineEvent, TimelineMarker>[K];
};

type StoryProps = SettingsControls & ViewConfigurationControls;

const meta = {
  title: "Timeline/Markers",
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
    "settings.markers": {
      control: {
        type: "object",
      },
      description: "Timeline markers configuration",
      table: {
        category: "settings",
        type: {
          summary: "TimelineMarker[]",
          detail: JSON.stringify(markersBaseConfig.settings.markers, null, 2),
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
          summary: "EventsViewOptions",
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
    "viewConfiguration.camera": {
      control: {
        type: "object",
      },
      description: "Camera view options",
      table: {
        category: "viewConfiguration",
        type: {
          summary: "CameraViewOptions",
          detail: `Available zoom modes:\n${Object.entries(ZoomMode)
            .map(([key, value]) => `- ${key}: "${value}"`)
            .join(
              "\n",
            )}\n\nDefault configuration:\n${JSON.stringify(defaultViewConfig.camera, null, 2)}`,
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
  "viewConfiguration.camera": defaultViewConfig.camera,
};

export const Basic: Story = {
  args: {
    "settings.start": markersBaseConfig.settings.start,
    "settings.end": markersBaseConfig.settings.end,
    "settings.axes": markersBaseConfig.settings.axes,
    "settings.events": markersBaseConfig.settings.events,
    "settings.markers": markersBaseConfig.settings.markers,
    ...defaultViewConfigArgs,
  },
  parameters: {
    storyKey: "basic",
    docs: {
      description: {
        story: "Basic timeline configuration with markers",
      },
    },
  },
};

export const WithCollapse: Story = {
  args: {
    "settings.start": collapsedBaseConfig.settings.start,
    "settings.end": collapsedBaseConfig.settings.end,
    "settings.axes": collapsedBaseConfig.settings.axes,
    "settings.events": collapsedBaseConfig.settings.events,
    "settings.markers": collapsedBaseConfig.settings.markers,
    ...defaultViewConfigArgs,
  },
  parameters: {
    storyKey: "withCollapse",
    docs: {
      description: {
        story: "Basic timeline configuration with markers",
      },
    },
  },
};

export const WithLabels: Story = {
  args: {
    "settings.start": markersWithLabelsConfig.settings.start,
    "settings.end": markersWithLabelsConfig.settings.end,
    "settings.axes": markersWithLabelsConfig.settings.axes,
    "settings.events": markersWithLabelsConfig.settings.events,
    "settings.markers": markersWithLabelsConfig.settings.markers,
    ...defaultViewConfigArgs,
  },
  parameters: {
    storyKey: "with labels",
    docs: {
      description: {
        story: "Timeline configuration with markers that have labels",
      },
    },
  },
};

export const CustomRenderer: Story = {
  args: {
    "settings.start": markersCustomRenderer.settings.start,
    "settings.end": markersCustomRenderer.settings.end,
    "settings.axes": markersCustomRenderer.settings.axes,
    "settings.events": markersCustomRenderer.settings.events,
    "settings.markers": markersCustomRenderer.settings.markers,
    "settings.selectedEventIds": baseTimelineConfig.settings.selectedEventIds,
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

export const GroupZoomDemo: StoryObj<StoryProps> = {
  args: {
    "settings.start": Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
    "settings.end": Date.now() + 24 * 60 * 60 * 1000, // 1 day from now
    "settings.axes": baseTimelineConfig.settings.axes,
    "settings.events": baseTimelineConfig.settings.events,
    "settings.markers": [
      // Create markers that will be grouped together
      ...Array.from({ length: 20 }, (_, i) => ({
        time: Date.now() + i * 1000, // 1 second apart
        color: "#ff6b6b",
        activeColor: "#ff5252",
        hoverColor: "#ff1744",
        label: `Marker ${i + 1}`,
      })),
      {
        time: Date.now() + 30000, // 30 seconds later
        color: "#4ecdc4",
        activeColor: "#26c6da",
        hoverColor: "#00bcd4",
        label: "Distant Marker",
      },
      {
        time: Date.now() + 60000, // 1 minute later
        color: "#45b7d1",
        activeColor: "#29b6f6",
        hoverColor: "#03a9f4",
        label: "Another Distant",
      },
    ],
    "viewConfiguration.markers": {
      ...defaultViewConfig.markers,
      collapseMinDistance: 8, // Larger distance for better grouping
      groupZoomEnabled: true,
      groupZoomPadding: 0.3, // 30% padding around group
      groupZoomMaxFactor: 0.3, // Max zoom factor
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates the group zoom functionality. When you click on a grouped marker (showing a number), the timeline will zoom to show all individual markers in that group. Try clicking on the grouped markers to see the zoom effect.",
      },
    },
  },
};
