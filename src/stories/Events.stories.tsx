import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  baseTimelineConfig,
  customRendererConfig,
  endlessTimelineConfig,
} from "./configs/events";
import { defaultViewConfig } from "../constants/options";
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
  title: "Timeline/Events",
  component: StoryWrapper as React.ComponentType<StoryProps>,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
The Events component is responsible for managing and rendering timeline events. It handles event selection, interaction, and rendering with support for custom event renderers through AbstractEventRenderer.

## Key Features

- **Event Rendering**: Display events as colored bars on timeline tracks
- **Event Selection**: Single and multiple event selection with visual feedback
- **Custom Renderers**: Ability to customize event appearance and behavior
- **Spatial Indexing**: Efficient rendering and interaction with many events
- **Event Interaction**: Click, hover, and context menu support
- **Flexible Positioning**: Events can span time ranges or be point-in-time

## Event Structure

Each event in the timeline has the following structure:

\`\`\`typescript
type TimelineEvent = {
  id: string;              // Unique event identifier
  from: number;            // Start timestamp
  to?: number;             // Optional end timestamp
  axisId: string;          // ID of the axis this event belongs to
  trackIndex: number;      // Index of the track within the axis
  renderer?: AbstractEventRenderer; // Optional custom renderer
  color?: string;          // Optional event color
  selectedColor?: string;  // Optional color when selected
};
\`\`\`

## Event Configuration

### Basic Settings

\`\`\`typescript
const timeline = new Timeline({
  settings: {
    axes: [{
      id: 'axis1',
      tracksCount: 3,
      top: 0,
      height: 100
    }],
    events: [
      {
        id: 'event1',
        axisId: 'axis1',
        trackIndex: 0,
        from: Date.now(),
        to: Date.now() + 1800000,  // 30 minutes
        color: '#ff6b6b',
        selectedColor: '#ff5252'
      },
      {
        id: 'event2',
        axisId: 'axis1',
        trackIndex: 1,
        from: Date.now() + 900000,  // 15 minutes later
        to: Date.now() + 2700000,   // 45 minutes duration
        color: '#4ecdc4',
        selectedColor: '#26c6da'
      }
    ]
  }
});
\`\`\`

### Display Settings

\`\`\`typescript
viewConfiguration: {
  events: {
    font: '12px Arial',              // Font for event labels
    hitboxPadding: 4                 // Padding for click detection
  }
}
\`\`\`

## Event Types and Use Cases

### Basic Events

Simple events with start and end times:

\`\`\`typescript
const basicEvents = [
  {
    id: 'meeting',
    axisId: 'schedule',
    trackIndex: 0,
    from: Date.now(),
    to: Date.now() + 3600000,  // 1 hour
    color: '#3b82f6',
    selectedColor: '#1d4ed8'
  }
];
\`\`\`

### Point-in-Time Events

Events that represent a specific moment:

\`\`\`typescript
const pointEvents = [
  {
    id: 'milestone',
    axisId: 'project',
    trackIndex: 0,
    from: Date.now(),
    // No 'to' - represents a point in time
    color: '#f59e0b',
    selectedColor: '#d97706'
  }
];
\`\`\`

## Custom Event Renderers

Create custom renderers for specialized event visualization:

\`\`\`typescript
import { AbstractEventRenderer } from '@gravity-ui/timeline';

class CustomEventRenderer extends AbstractEventRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    event: TimelineEvent,
    isSelected: boolean,
    x0: number,
    x1: number,
    y: number,
    h: number,
  ) {
    // Custom rendering logic
    ctx.beginPath();
    ctx.fillStyle = isSelected ? '#5469d4' : event.color || '#333333';
    ctx.roundRect(x0, y - h/2, x1 - x0, h, 4);
    ctx.fill();
    
    // Add border
    ctx.strokeStyle = isSelected ? '#4338ca' : '#6b7280';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Add event ID as label
    if (event.id) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(event.id, (x0 + x1) / 2, y);
    }
  }

  getHitbox(event: TimelineEvent, x0: number, x1: number): Hitbox {
    return {
      top: 0,
      right: x1,
      bottom: 0,
      left: x0
    };
  }
}
\`\`\`

## Event Selection

### Single Selection

By default, only one event can be selected at a time:

\`\`\`typescript
// Select a single event
timeline.api.setSelectedEvents(['event1']);

// Get selected events
const selected = timeline.api.getSelectedEvents();
console.log('Selected:', selected);
\`\`\`

### Multiple Selection

Enable multiple event selection:

\`\`\`typescript
// Enable multiple selection
const events = timeline.api.getComponent('Events');
events.allowMultipleSelection = true;

// Select multiple events
timeline.api.setSelectedEvents(['event1', 'event2', 'event3']);
\`\`\`

### Selection with Options

Advanced selection with custom options:

\`\`\`typescript
// Select events with options
const events = timeline.api.getComponent('Events');
events.selectEvents([event1, event2], {
  append: true,    // Add to existing selection
  toggle: true     // Toggle selection state
});
\`\`\`

## Click Filtering

Control which events can be selected through custom filtering:

\`\`\`typescript
const timeline = new Timeline({
  settings: {
    clickEventsCollectionFilter: (candidates: TimelineEvent[]) => {
      // Custom filtering logic
      return candidates.filter(event => {
        // Example: Only allow selection of active events
        return event.status === 'active';
      });
    }
  }
});
\`\`\`

**Filter Function Details:**
- **Input**: Array of events at the click position
- **Output**: Filtered array of selectable events
- **When called**: Before event selection and event emission
- **Use cases**: Implement permissions, business rules, or custom selection logic

## Event Handling

### Click Events

Listen for click events on the timeline:

\`\`\`typescript
timeline.on('on-click', (event) => {
  const { events, markers } = event.detail;
  console.log('Clicked events:', events);
  console.log('Clicked markers:', markers);
});
\`\`\`

### Context Menu Events

Handle right-click events:

\`\`\`typescript
timeline.on('on-context-click', (event) => {
  const { event: clickedEvent, time, relativeX, relativeY } = event.detail;
  console.log('Context clicked:', {
    event: clickedEvent,
    time,
    position: { x: relativeX, y: relativeY }
  });
});
\`\`\`

### Hover Events

Track event hover states:

\`\`\`typescript
timeline.on('on-hover', (event) => {
  const { event: hoveredEvent, time, relativeX, relativeY } = event.detail;
  console.log('Hovered event:', hoveredEvent);
});
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
    "settings.selectedEventIds": {
      control: {
        type: "object",
      },
      description: "Selected event ids",
      table: {
        category: "settings",
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
    "settings.start": baseTimelineConfig.settings.start,
    "settings.end": baseTimelineConfig.settings.end,
    "settings.axes": baseTimelineConfig.settings.axes,
    "settings.events": baseTimelineConfig.settings.events,
    "settings.selectedEventIds": baseTimelineConfig.settings.selectedEventIds,
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
    "settings.selectedEventIds": baseTimelineConfig.settings.selectedEventIds,
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
