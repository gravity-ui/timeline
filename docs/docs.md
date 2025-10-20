# @gravity-ui/timeline Documentation

A powerful React-based library for building interactive timeline visualizations with canvas rendering.

## Overview

The Timeline library provides a flexible and performant way to create interactive timeline visualizations. It's built with React and uses canvas for rendering, offering a rich set of features for displaying and interacting with time-based data.

## Core Components

The library consists of several core components that work together to create the timeline visualization:

### [Timeline](./Timeline.md)
The main class that orchestrates the timeline visualization. It manages the canvas, components, and user interactions.

```typescript
import { Timeline, ZoomMode } from '@gravity-ui/timeline';

const timeline = new Timeline({
  settings: {
    start: Date.now(),
    end: Date.now() + 3600000,
    axes: [],
    events: []
  },
  viewConfiguration: {
    camera: {
      zoom: ZoomMode.DEFAULT
    }
  }
});
```

### [Events](./Events.md)
Manages and renders timeline events with support for selection, interaction, and custom rendering.

```typescript
// Events are managed through the Timeline instance
timeline.settings.events = [{
  id: '1',
  axisId: 'axis1',
  trackIndex: 0,
  from: Date.now(),
  to: Date.now() + 1800000
}];
```

### [Ruler](./Ruler.md)
Renders the time scale and labels on the timeline, handling time intervals and grid lines. Supports custom level labels for defining custom time granularity and formatting.

```typescript
// Ruler configuration through viewConfiguration
timeline.viewConfiguration.ruler = {
  height: 32,
  font: '12px Arial',
  spacing: 100
};

// Custom ruler level labels (optional)
timeline.settings.customLevelLabels = (rulerConfig) => {
  return [
    {
      domain: 1000 * 60 * 60 * 24 * 365,
      format: 'YYYY',
      step: (t) => t.add(1, 'year'),
      start: (t) => dayjs(t).startOf('year')
    }
  ];
};
```

### [Markers](./Markers.md)
Handles vertical marker lines and labels on the timeline, with support for collision avoidance.

```typescript
// Add markers to the timeline
timeline.settings.markers = [{
  time: Date.now(),
  color: '#ff0000',
  activeColor: '#ff5252',
  hoverColor: '#ff1744',
  label: 'Important Event'
}];
```

### [Sections](./Sections.md)
Renders background sections on the timeline to provide visual organization and highlight time periods.

```typescript
// Add sections to the timeline
timeline.settings.sections = [{
  id: 'phase1',
  from: Date.now(),
  to: Date.now() + 3600000,
  color: 'rgba(255, 235, 59, 0.3)',
  hoverColor: 'rgba(255, 235, 59, 0.4)'
}];
```

### [CanvasApi](./CanvasApi.md)
Provides the low-level canvas API for timeline manipulation and rendering.

```typescript
// CanvasApi is used internally by components
const api = timeline.api;
```

## React Integration

The library provides React components and hooks for easy integration:

### Components
- `TimelineCanvas`: React component for rendering the timeline

### Hooks
- `useTimeline`: Hook for managing timeline instance
- `useTimelineEvent`: Hook for handling timeline events

## Examples

### Basic Timeline
```typescript
import { TimelineCanvas, useTimeline } from '@gravity-ui/timeline/react';

function MyTimeline() {
  const { timeline } = useTimeline({
    settings: {
      start: Date.now(),
      end: Date.now() + 3600000,
      axes: [{
        id: 'axis1',
        tracksCount: 1,
        top: 0,
        height: 100
      }],
      events: [{
        id: '1',
        axisId: 'axis1',
        trackIndex: 0,
        from: Date.now(),
        to: Date.now() + 1800000
      }]
    }
  });

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <TimelineCanvas timeline={timeline} />
    </div>
  );
}
```

### Custom Event Renderer
```typescript
import { AbstractEventRenderer } from '@gravity-ui/timeline';

class CustomRenderer extends AbstractEventRenderer {
  render(ctx, event, isSelected, x0, x1, y, h) {
    // Custom rendering logic
  }
}

// Use custom renderer
const event = {
  id: '1',
  axisId: 'axis1',
  trackIndex: 0,
  from: Date.now(),
  to: Date.now() + 3600000,
  renderer: new CustomRenderer()
};
```

## Live Examples

Visit our [Storybook](https://preview.gravity-ui.com/timeline/) to explore interactive examples:

- [Basic Timeline](https://preview.gravity-ui.com/timeline/?path=/story/basic-timeline--default)
- [Multiple Axes](https://preview.gravity-ui.com/timeline/?path=/story/multiple-axes--default)
- [Custom Events](https://preview.gravity-ui.com/timeline/?path=/story/custom-events--default)
- [Markers](https://preview.gravity-ui.com/timeline/?path=/story/markers--default)
- [Grid Customization](https://preview.gravity-ui.com/timeline/?path=/story/grid-customization--default)
- [Ruler Customization](https://preview.gravity-ui.com/timeline/?path=/story/ruler-customization--default)

## Best Practices

- **Event Management**
  - Use unique IDs for events
  - Keep event data minimal for performance
  - Always provide required fields: `id`, `from`, `axisId`, `trackIndex`

- **Marker Configuration** 
  - Always provide `activeColor` and `hoverColor` (required fields)
  - Use meaningful labels for accessibility
  - Consider marker grouping for dense datasets

- **Interaction Handling**
  - Handle selection and interaction through event listeners
  - Use `useTimelineEvent` hook for React integration
  - Clean up event listeners to prevent memory leaks
  - Use `clickEventsCollectionFilter` and `clickMarkerCollectionFilter` to customize click behavior
  - Implement permission-based filtering for secure interactions

- **Ruler Configuration**
  - Choose appropriate time formats for the ruler
  - Use `customLevelLabels` to define business-specific time scales (quarters, fiscal years, sprints)
  - Consider the density of labels at different zoom levels
  - Leverage custom color functions to highlight specific time periods

- **Performance**
  - Use viewport culling for large datasets
  - Leverage spatial indexing for marker/event queries
  - Minimize the number of custom ruler levels for better performance

## API Reference

- [Timeline API](./Timeline.md)
- [Events API](./Events.md)
- [Ruler API](./Ruler.md)
- [Markers API](./Markers.md)
- [Sections API](./Sections.md)
- [CanvasApi API](./CanvasApi.md)

## Contributing

We welcome contributions! Please see our [contributing guide](../CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details. 