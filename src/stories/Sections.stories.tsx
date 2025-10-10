import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  basicSectionsConfig,
  customRenderersConfig,
  overlappingSectionsConfig,
  prioritySectionsConfig,
  timePeriodsConfig,
  workflowSectionsConfig,
} from "./configs/sections";
import { StoryWrapper } from "./StoryWrapper";
import {
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
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
    TimelineMarker,
    TimelineSection
  > as `settings.${K}`]: TimelineSettings<
    TimelineEvent,
    TimelineMarker,
    TimelineSection
  >[K];
};

type StoryProps = SettingsControls & ViewConfigurationControls;

const meta = {
  title: "Timeline/Sections",
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
      control: false,
      description: "Array of timeline axes",
      table: {
        category: "settings",
      },
    },
    "settings.events": {
      control: false,
      description: "Array of timeline events",
      table: {
        category: "settings",
      },
    },
    "settings.markers": {
      control: false,
      description: "Array of timeline markers",
      table: {
        category: "settings",
      },
    },
    "settings.sections": {
      control: false,
      description: "Array of timeline sections for background coloring",
      table: {
        category: "settings",
      },
    },
    "settings.selectedEventIds": {
      control: false,
      description: "Array of selected event IDs",
      table: {
        category: "settings",
      },
    },
    "viewConfiguration.hideRuler": {
      control: {
        type: "boolean",
      },
      description: "Hide the ruler component",
      table: {
        category: "view",
      },
    },
    "viewConfiguration.camera": {
      control: false,
      description: "Camera configuration",
      table: {
        category: "view",
      },
    },
    "viewConfiguration.sections": {
      control: false,
      description: "Sections view configuration",
      table: {
        category: "view",
      },
    },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Sections Component

The Sections component provides background coloring for timeline areas, helping to visually organize content and highlight time periods.

## Features

- **Background Areas**: Create colored background sections to organize timeline content
- **Hover Interaction**: Sections change color when hovered for visual feedback
- **Flexible Boundaries**: Sections can have explicit end times or extend to timeline end
- **Performance**: Optimized rendering with spatial indexing for large numbers of sections
- **Custom Rendering**: Support for custom section renderers

## Section Structure

\`\`\`typescript
type TimelineSection = {
  id: string;               // Unique section identifier
  from: number;             // Start timestamp
  to?: number;              // Optional end timestamp (defaults to timeline end)
  color: string;            // Background color of the section
  hoverColor?: string;      // Optional color when section is hovered
  renderer?: AbstractSectionRenderer; // Optional custom renderer
};
\`\`\`

## Use Cases

- **Time Periods**: Highlight different phases (morning, afternoon, evening)
- **Priority Areas**: Color-code sections by importance or urgency
- **Workflow States**: Visualize different stages of a process
- **Context Zones**: Provide background context for timeline events
        `,
      },
    },
  },
} satisfies Meta<StoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    "settings.start": basicSectionsConfig.settings.start,
    "settings.end": basicSectionsConfig.settings.end,
    "settings.axes": basicSectionsConfig.settings.axes,
    "settings.events": basicSectionsConfig.settings.events,
    "settings.markers": basicSectionsConfig.settings.markers || [],
    "settings.sections": basicSectionsConfig.settings.sections || [],
    "settings.selectedEventIds":
      basicSectionsConfig.settings.selectedEventIds || [],
    "viewConfiguration.hideRuler": false,
    "viewConfiguration.camera": {
      zoom: ZoomMode.DEFAULT,
    },
  },
  parameters: {
    docs: {
      description: {
        story: `
Basic sections example showing three distinct phases with different colors.
Each section has a semi-transparent background that doesn't interfere with timeline content.

**Features Demonstrated:**
- Simple section boundaries with explicit start and end times
- Color-coded phases (yellow, green, red)
- Hover effects for interactive feedback
- Sections that don't overlap with events
        `,
      },
    },
  },
};

export const OverlappingSections: Story = {
  args: {
    "settings.start": overlappingSectionsConfig.settings.start,
    "settings.end": overlappingSectionsConfig.settings.end,
    "settings.axes": overlappingSectionsConfig.settings.axes,
    "settings.events": overlappingSectionsConfig.settings.events,
    "settings.markers": overlappingSectionsConfig.settings.markers || [],
    "settings.sections": overlappingSectionsConfig.settings.sections || [],
    "settings.selectedEventIds":
      overlappingSectionsConfig.settings.selectedEventIds || [],
    "viewConfiguration.hideRuler": false,
    "viewConfiguration.camera": {
      zoom: ZoomMode.DEFAULT,
    },
  },
  parameters: {
    docs: {
      description: {
        story: `
Example showing overlapping sections with different priority levels.
Demonstrates how sections can layer to provide multiple levels of context.

**Features Demonstrated:**
- Multiple overlapping sections
- Different opacity levels for visual hierarchy
- Background section covering entire timeline
- Nested critical periods with higher opacity
- Layered visual organization
        `,
      },
    },
  },
};

export const WorkflowPhases: Story = {
  args: {
    "settings.start": workflowSectionsConfig.settings.start,
    "settings.end": workflowSectionsConfig.settings.end,
    "settings.axes": workflowSectionsConfig.settings.axes,
    "settings.events": workflowSectionsConfig.settings.events,
    "settings.markers": workflowSectionsConfig.settings.markers || [],
    "settings.sections": workflowSectionsConfig.settings.sections || [],
    "settings.selectedEventIds":
      workflowSectionsConfig.settings.selectedEventIds || [],
    "viewConfiguration.hideRuler": false,
    "viewConfiguration.camera": {
      zoom: ZoomMode.DEFAULT,
    },
  },
  parameters: {
    docs: {
      description: {
        story: `
Workflow phases example demonstrating a software development process.
Shows how sections can represent different stages of a project lifecycle.

**Features Demonstrated:**
- Development workflow phases (planning → development → testing → deployment)
- Phase transitions marked by milestones
- Process visualization with coordinated colors
- Integration of sections, events, and markers
- Project timeline management
- Sequential phase representation
        `,
      },
    },
  },
};

export const CustomRenderers: Story = {
  args: {
    "settings.start": customRenderersConfig.settings.start,
    "settings.end": customRenderersConfig.settings.end,
    "settings.axes": customRenderersConfig.settings.axes,
    "settings.events": customRenderersConfig.settings.events,
    "settings.markers": customRenderersConfig.settings.markers || [],
    "settings.sections": customRenderersConfig.settings.sections || [],
    "settings.selectedEventIds":
      customRenderersConfig.settings.selectedEventIds || [],
    "viewConfiguration.hideRuler": false,
    "viewConfiguration.camera": {
      zoom: ZoomMode.DEFAULT,
    },
  },
  parameters: {
    docs: {
      description: {
        story: `
Advanced sections example demonstrating custom renderers with enhanced visual effects.
Shows how to create sophisticated section visualizations beyond basic colored backgrounds.

**Custom Features Demonstrated:**
- **Gradient Backgrounds**: Horizontal and vertical gradients for smooth color transitions
- **Pattern Fills**: Dot and stripe patterns for visual texture
- **Custom Borders**: Colored borders with configurable width
- **Enhanced Hover Effects**: Glow effects and visual feedback
- **Advanced Rendering**: Custom AbstractSectionRenderer implementation

**Technical Details:**
- Uses MySectionRenderer class extending AbstractSectionRenderer
- Demonstrates pattern rendering (dots, stripes)
- Shows gradient creation and color manipulation
- Custom border and hover effect implementation
- Advanced canvas rendering techniques

This example is perfect for creating visually rich timelines with professional appearance.
        `,
      },
    },
  },
};
