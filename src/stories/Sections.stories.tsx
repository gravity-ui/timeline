import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  basicSectionsConfig,
  customRenderersConfig,
  overlappingSectionsConfig,
  workflowSectionsConfig,
} from "./configs/sections";
import { StoryWrapper } from "./StoryWrapper";
import { defaultViewConfig } from "../constants/options";
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
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: ` 
# Sections

The Sections component is responsible for rendering background sections on the timeline. It provides colored background areas that help visually organize timeline content and highlight time periods.

## Key Features

- **Background Sections**: Colored background areas for visual organization
- **Time Period Highlighting**: Highlight specific time ranges on the timeline
- **Hover Effects**: Interactive hover states for better user experience
- **Custom Renderers**: Ability to customize section appearance
- **Spatial Indexing**: Efficient rendering and interaction with many sections
- **Flexible Boundaries**: Sections can extend to timeline end or have specific end times

## Section Structure

Each section in the timeline has the following structure:

\`\`\`typescript
type TimelineSection = {
  id: string;                          // Unique section identifier
  from: number;                        // Start timestamp
  to?: number;                         // Optional end timestamp (defaults to timeline end)
  color: string;                       // Section background color
  hoverColor?: string;                 // Optional color when section is hovered
  renderer?: AbstractSectionRenderer;  // Optional custom renderer
};
\`\`\`

## Section Configuration

### Basic Settings

\`\`\`typescript
const timeline = new Timeline({
  settings: {
    sections: [
      {
        id: 'morning',
        from: Date.now(),
        to: Date.now() + 1800000,  // 30 minutes
        color: 'rgba(255, 235, 59, 0.3)',  // Light yellow
        hoverColor: 'rgba(255, 235, 59, 0.4)'
      },
      {
        id: 'afternoon',
        from: Date.now() + 1800000,
        // No 'to' - extends to timeline end
        color: 'rgba(76, 175, 80, 0.3)',   // Light green
        hoverColor: 'rgba(76, 175, 80, 0.4)'
      }
    ]
  }
});
\`\`\`

### Display Settings

\`\`\`typescript
viewConfiguration: {
  sections: {
    hitboxPadding: 2  // Padding for hover detection area
  }
}
\`\`\`

## Section Types and Use Cases

### Basic Sections

Simple background sections for visual organization:

\`\`\`typescript
const basicSections = [
  {
    id: 'phase1',
    from: Date.now(),
    to: Date.now() + 2400000,
    color: 'rgba(33, 150, 243, 0.2)',  // Blue
    hoverColor: 'rgba(33, 150, 243, 0.3)'
  }
];
\`\`\`

### Overlapping Sections

Sections that can overlap to show multiple time periods:

\`\`\`typescript
const overlappingSections = [
  {
    id: 'project',
    from: Date.now(),
    to: Date.now() + 7200000,  // 2 hours
    color: 'rgba(76, 175, 80, 0.2)',   // Green
  },
  {
    id: 'meeting',
    from: Date.now() + 1800000,  // 30 minutes in
    to: Date.now() + 3600000,    // 1 hour duration
    color: 'rgba(255, 152, 0, 0.3)',   // Orange
  }
];
\`\`\`

### Workflow Phases

Sections representing different phases of a workflow:

\`\`\`typescript
const workflowPhases = [
  {
    id: 'planning',
    from: Date.now(),
    to: Date.now() + 1800000,
    color: 'rgba(156, 39, 176, 0.2)',  // Purple
  },
  {
    id: 'development',
    from: Date.now() + 1800000,
    to: Date.now() + 5400000,
    color: 'rgba(33, 150, 243, 0.2)',  // Blue
  },
  {
    id: 'testing',
    from: Date.now() + 5400000,
    to: Date.now() + 7200000,
    color: 'rgba(255, 152, 0, 0.2)',   // Orange
  }
];
\`\`\`

## Custom Section Renderers

Create custom renderers for specialized section visualization:

\`\`\`typescript
import { AbstractSectionRenderer } from '@gravity-ui/timeline';

class GradientSectionRenderer extends AbstractSectionRenderer {
  render({
    ctx,
    section,
    x0,
    x1,
    y0,
    h,
    isHovered
  }: {
    ctx: CanvasRenderingContext2D;
    section: TimelineSection;
    x0: number;
    x1: number;
    y0: number;
    h: number;
    isHovered: boolean;
  }) {
    // Create gradient background
    const gradient = ctx.createLinearGradient(x0, y0 - h/2, x0, y0 + h/2);
    
    if (isHovered) {
      gradient.addColorStop(0, section.hoverColor || section.color);
      gradient.addColorStop(1, 'transparent');
    } else {
      gradient.addColorStop(0, section.color);
      gradient.addColorStop(1, 'transparent');
    }
    
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.rect(x0, y0 - h/2, x1 - x0, h);
    ctx.fill();
    
    // Add border
    ctx.beginPath();
    ctx.strokeStyle = isHovered ? '#666' : '#999';
    ctx.lineWidth = 1;
    ctx.rect(x0, y0 - h/2, x1 - x0, h);
    ctx.stroke();
  }

  getHitbox(section: TimelineSection, x0: number, x1: number): Hitbox {
    return {
      left: x0,
      right: x1,
      top: 0,
      bottom: 0
    };
  }
}
\`\`\`

## Performance Optimizations

### Spatial Indexing

Sections use RBush spatial indexing for efficient intersection queries:

\`\`\`typescript
// Efficient rectangular queries for large numbers of sections
const sectionsInViewport = sections.getSectionsAt(viewportRect);
\`\`\`

### Viewport Culling

Only sections that intersect with the current viewport are rendered:

\`\`\`typescript
// Automatic viewport culling during render
const { start, end } = this.api.getInterval();
const visibleSections = sections.filter(section => 
  intersects(section.from, section.to || end, start, end)
);
\`\`\`

### Hover Detection Optimization

Hover detection uses configurable hitbox padding to balance responsiveness and performance:

\`\`\`typescript
// Configurable hitbox padding
const { hitboxPadding } = this.api.getViewConfiguration().sections;
\`\`\`

## Rendering Order

Sections are rendered first in the timeline rendering pipeline, ensuring they appear behind all other timeline elements:

\`\`\`typescript
// Rendering order in Timeline
1. Sections (background)
2. Grid 
3. Axes
4. Events
5. Ruler
6. Markers (foreground)
\`\`\``,
      },
    },
  },
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

export const Overview: Story = {
  args: {
    "settings.start": basicSectionsConfig.settings.start,
    "settings.end": basicSectionsConfig.settings.end,
    "settings.axes": basicSectionsConfig.settings.axes,
    "settings.events": basicSectionsConfig.settings.events,
    "settings.sections": basicSectionsConfig.settings.sections,
    ...defaultViewConfigArgs,
  },
  parameters: {
    storyKey: "overview",
    docs: {
      description: {
        story:
          "Overview of the Sections component with basic configuration and usage examples",
      },
    },
  },
};

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
