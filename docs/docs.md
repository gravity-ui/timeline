# @gravity-ui/timeline Documentation

A powerful React-based library for building interactive timeline visualizations with canvas rendering.

## Overview

The Timeline library provides a flexible and performant way to create interactive timeline visualizations. It's built with React and uses canvas for rendering, offering a rich set of features for displaying and interacting with time-based data.

## Core Components

The library consists of several core components that work together to create the timeline visualization:

### [Timeline](./Timeline.md)
The main class that orchestrates the timeline visualization. It manages the canvas, components, and user interactions.

```typescript
import { Timeline } from '@gravity-ui/timeline';

const timeline = new Timeline({
  settings: {
    start: Date.now(),
    end: Date.now() + 3600000,
    axes: [],
    events: []
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
Renders the time scale and labels on the timeline, handling time intervals and grid lines.

```typescript
// Ruler configuration through viewConfiguration
timeline.viewConfiguration.ruler = {
  height: 32,
  font: '12px Arial',
  spacing: 100
};
```

### [Markers](./Markers.md)
Handles vertical marker lines and labels on the timeline, with support for collision avoidance.

```typescript
// Add markers to the timeline
timeline.settings.markers = [{
  time: Date.now(),
  color: '#ff0000',
  label: 'Important Event'
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
- `TimelineProvider`: Context provider for timeline state

### Hooks
- `useTimeline`: Hook for managing timeline instance
- `useTimelineEvents`: Hook for handling timeline events

## Examples

### Basic Timeline
```typescript
import { TimelineCanvas } from '@gravity-ui/timeline';

function MyTimeline() {
  return (
    <TimelineCanvas
      settings={{
        start: Date.now(),
        end: Date.now() + 3600000,
        axes: [{
          id: 'axis1',
          tracksCount: 1
        }],
        events: [{
          id: '1',
          axisId: 'axis1',
          trackIndex: 0,
          from: Date.now(),
          to: Date.now() + 1800000
        }]
      }}
    />
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

   - Use unique IDs for events
   - Keep event data minimal
   - Handle selection and interaction through event listeners
   - Choose appropriate time formats for the ruler
   - Use the provided React components and hooks

## API Reference

- [Timeline API](./Timeline.md)
- [Events API](./Events.md)
- [Ruler API](./Ruler.md)
- [Markers API](./Markers.md)
- [CanvasApi API](./CanvasApi.md)

## Contributing

We welcome contributions! Please see our [contributing guide](../CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details. 