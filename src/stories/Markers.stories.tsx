import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { baseTimelineConfig } from "./configs/events";
import {
  markersBaseConfig,
  markersCustomRenderer,
  markersWithLabelsConfig,
} from "./configs/markers";
import { defaultViewConfig } from "../constants/options";
import { StoryWrapper } from "./StoryWrapper";
import {
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
  TimelineSettings,
  ViewConfiguration,
} from "../types";
import { MarkerDeselectionMode, ZoomMode } from "../enums";

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
  title: "Components/Markers",
  component: StoryWrapper as React.ComponentType<StoryProps>,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `

The Markers component is responsible for rendering timeline markers on the canvas. It handles vertical marker lines, labels, and their positioning with collision avoidance.

## Key Features

- **Vertical Markers**: Display temporal points on the timeline
- **Marker Labels**: Text labels with automatic collision avoidance
- **Marker Grouping**: Automatic grouping of closely positioned markers
- **Group Zoom**: Click on marker groups for detailed view
- **Selection and Hover**: Interactive marker states
- **Custom Renderers**: Ability to customize appearance

## Marker Structure

Each marker in the timeline has the following structure:

\`\`\`typescript
type TimelineMarker = {
  time: number;                    // Timestamp for marker position
  color: string;                   // Marker line color
  activeColor: string;             // Color when marker is selected (required)
  hoverColor: string;              // Color when marker is hovered (required)
  lineWidth?: number;              // Optional marker line width
  label?: string;                  // Optional label text
  labelColor?: string;             // Optional label color
  renderer?: AbstractMarkerRenderer; // Optional custom renderer
  nonSelectable?: boolean;         // Whether marker can be selected
  group?: boolean;                 // Whether marker represents a group
};
\`\`\`

## Marker Configuration

### Basic Settings

\`\`\`typescript
const timeline = new Timeline({
  settings: {
    markers: [
      {
        time: Date.now(),
        color: '#ff0000',
        activeColor: '#ff5252',
        hoverColor: '#ff1744',
        label: 'Important Event',
        lineWidth: 2
      }
    ]
  }
});
\`\`\`

### Display Settings

\`\`\`typescript
viewConfiguration: {
  markers: {
    font: '12px Arial',              // Font for labels
    groupColor: '#fe7f2d',          // Color for grouped markers
    groupColorHover: '#ff0000',     // Color when hovering over group
    hitboxPadding: 2,               // Padding for click area
    collapseMinDistance: 4,         // Minimum distance for grouping
    collapseEnabled: true,          // Enable grouping
    groupZoomEnabled: true,         // Enable group zoom
    groupZoomPadding: 0.2,          // Padding around group (20%)
    groupZoomMaxFactor: 0.5         // Maximum zoom factor
  }
}
\`\`\`

## Grouping and Zoom

### Automatic Grouping

Markers are automatically grouped when they are positioned closer than \`collapseMinDistance\` pixels. Grouped markers are displayed as a single marker with a number showing the count of markers in the group.

### Group Zoom

When clicking on a grouped marker, the timeline automatically zooms to display all individual markers in that group.

#### Group Zoom Events

\`\`\`typescript
timeline.on('on-group-marker-click', (event) => {
  const { groupMarker, originalMarkers, newInterval } = event.detail;
  
  console.log('Group clicked:', {
    groupMarker,           // The grouped marker that was clicked
    originalMarkers,       // Array of all markers in the group
    newInterval: {          // New timeline interval
      start: number,
      end: number
    }
  });
});
\`\`\`

## Render Priority

The Markers component implements a right-to-left rendering strategy for labels to prevent overlapping. Additionally, selected and hovered markers have render priority, meaning their labels will always be displayed even if they overlap with other labels:

- **Standard Labels**: Rendered right-to-left with collision avoidance
- **Priority Labels**: Selected and hovered markers bypass collision detection
- **Render Order**: Priority labels are positioned optimally without considering other labels

## Performance

### Spatial Indexing

The Markers component uses RBush spatial indexing for efficient marker queries:

\`\`\`typescript
// Spatial index automatically handles large numbers of markers
const index = new RBush<BBox & { marker: TMarker }>(MAX_INDEX_TREE_WIDTH);

// Efficient rectangular queries
const markers = timeline.api.getComponent('Markers');
const markersInArea = markers.getMarkersAt(boundingRect);
\`\`\`

This ensures high-performance rendering and interaction even with thousands of markers.

### Viewport Culling

Only markers visible within the current viewport (plus overscan) are rendered:

\`\`\`typescript
// Only render markers that intersect with the visible time range
const visibleMarkers = sortedMarkers.filter(marker => 
  intersects(marker.time, viewStart, viewEnd)
);
\`\`\`

### Text Dimension Caching

Label dimensions are cached to avoid repeated canvas measurements:

\`\`\`typescript
// Cache avoids expensive measureText() calls
const cachedSize = this.textWidthCache.get(labelText);
\`\`\`

## Custom Marker Renderers

Create custom renderers for specialized marker visualization:

\`\`\`typescript
import { AbstractMarkerRenderer } from '@gravity-ui/timeline';

class CustomMarkerRenderer extends AbstractMarkerRenderer {
  render(data: {
    ctx: CanvasRenderingContext2D;
    marker: TimelineMarker;
    isSelected: boolean;
    isHovered: boolean;
    markerPosition: number;
    viewConfiguration: ViewConfiguration;
    lastRenderedLabelPosition: { top: number; bottom: number };
    timeToPosition: (n: number) => number;
    getLabelSize: (label: string) => LabelSize;
  }) {
    const { ctx, marker, isSelected, isHovered, markerPosition } = data;
    
    // Custom marker line rendering
    ctx.beginPath();
    ctx.strokeStyle = isSelected ? marker.activeColor : 
                     isHovered ? marker.hoverColor : marker.color;
    ctx.lineWidth = marker.lineWidth || 2;
    ctx.moveTo(markerPosition, 0);
    ctx.lineTo(markerPosition, 200);
    ctx.stroke();
    
    // Custom label rendering
    if (marker.label) {
      ctx.fillStyle = marker.labelColor || '#333333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(marker.label, markerPosition, 20);
    }
  }
}
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
    "settings.markerDeselectionMode": {
      control: {
        type: "select",
      },
      options: Object.values(MarkerDeselectionMode),
      description: "Marker deselection behavior mode",
      table: {
        category: "settings",
        type: {
          summary: "MarkerDeselectionMode",
          detail: `Available modes:\n${Object.entries(MarkerDeselectionMode)
            .map(([key, value]) => `- ${key}: "${value}"`)
            .join(
              "\n",
            )}\n\nDefault: ${MarkerDeselectionMode.ON_CLICK_ANYWHERE}`,
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

export const Overview: Story = {
  args: {
    "settings.start": markersBaseConfig.settings.start,
    "settings.end": markersBaseConfig.settings.end,
    "settings.axes": markersBaseConfig.settings.axes,
    "settings.events": markersBaseConfig.settings.events,
    "settings.markers": markersBaseConfig.settings.markers,
    "settings.markerDeselectionMode": MarkerDeselectionMode.ON_CLICK_ANYWHERE,
    ...defaultViewConfigArgs,
  },
  parameters: {
    storyKey: "overview",
    docs: {
      description: {
        story:
          "Overview of the Markers component with basic configuration and usage examples",
      },
    },
  },
};

export const Basic: Story = {
  args: {
    "settings.start": markersBaseConfig.settings.start,
    "settings.end": markersBaseConfig.settings.end,
    "settings.axes": markersBaseConfig.settings.axes,
    "settings.events": markersBaseConfig.settings.events,
    "settings.markers": markersBaseConfig.settings.markers,
    "settings.markerDeselectionMode": MarkerDeselectionMode.ON_CLICK_ANYWHERE,
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

export const WithLabels: Story = {
  args: {
    "settings.start": markersWithLabelsConfig.settings.start,
    "settings.end": markersWithLabelsConfig.settings.end,
    "settings.axes": markersWithLabelsConfig.settings.axes,
    "settings.events": markersWithLabelsConfig.settings.events,
    "settings.markers": markersWithLabelsConfig.settings.markers,
    "settings.markerDeselectionMode": MarkerDeselectionMode.ON_CLICK_ANYWHERE,
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
    "settings.markerDeselectionMode": MarkerDeselectionMode.ON_CLICK_ANYWHERE,
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
    "settings.markerDeselectionMode": MarkerDeselectionMode.ON_CLICK_ANYWHERE,
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
