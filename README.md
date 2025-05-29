# Timeline Library

A React-based library for building interactive timeline visualizations with canvas rendering.

## Features

- Canvas-based rendering for high performance
- Interactive timeline with zoom and pan capabilities
- Support for events, markers, axes, and grid
- Customizable appearance and behavior
- TypeScript support with full type definitions
- React integration with custom hooks

## Installation

```bash
npm install timeline
```

## Usage

The timeline component can be used in React applications with the following basic setup:

```tsx
import { TimelineCanvas } from 'timeline';
import { useTimeline } from 'timeline';

const MyTimelineComponent = () => {
  const { timeline } = useTimeline({
    settings: {
      start: Date.now(),
      end: Date.now() + 3600000, // 1 hour from now
      axes: [],
      events: [],
      markers: []
    },
    viewConfiguration: {
      // Optional view configuration
    }
  });

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <TimelineCanvas timeline={timeline} />
    </div>
  );
};
```

## How It Works

The timeline component is built using React and provides a flexible way to create interactive timeline visualizations. Here's how it works:

### Component Architecture

The timeline is implemented as a React component that can be configured through two main objects:

1. **TimelineSettings**: Controls the core timeline behavior and appearance
   - `start`: Start time of the timeline
   - `end`: End time of the timeline
   - `axes`: Array of axis configurations
   - `events`: Array of event configurations
   - `markers`: Array of marker configurations

2. **ViewConfiguration**: Manages the visual representation and interaction settings
   - Controls appearance, zoom levels, and interaction behavior
   - Can be customized or use default values

### Event Handling

The timeline component supports several interactive events:

- `on-click`: Triggered when clicking on the timeline
- `on-context-click`: Triggered on right-click/context menu
- `on-select-change`: Fired when the selection changes
- `on-hover`: Triggered when hovering over timeline elements
- `on-leave`: Fired when the mouse leaves timeline elements

Example of event handling:

```tsx
import { useTimelineEvent } from 'timeline';

const MyTimelineComponent = () => {
  const { timeline } = useTimeline({ /* ... */ });

  useTimelineEvent(timeline, 'on-click', (data) => {
    console.log('Timeline clicked:', data);
  });

  useTimelineEvent(timeline, 'on-select-change', (data) => {
    console.log('Selection changed:', data);
  });

  return <TimelineCanvas timeline={timeline} />;
};
```

### React Integration

The component uses custom hooks for timeline management:

- `useTimeline`: Manages the timeline instance and its lifecycle
  - Creates and initializes the timeline
  - Handles cleanup on component unmount
  - Provides access to the timeline instance

- `useTimelineEvent`: Handles event subscriptions and cleanup
  - Manages event listener lifecycle
  - Automatically cleans up listeners on unmount

The component automatically handles cleanup and destruction of the timeline instance when unmounted.

## Development

### Storybook

This project includes Storybook for component development and documentation.

To run Storybook:

```bash
npm run storybook
```

This will start the Storybook development server on port 6006. You can access it at http://localhost:6006.

To build a static version of Storybook for deployment:

```bash
npm run build-storybook
```

For more information on using Storybook, see the [Storybook README](.storybook/README.md).

## License

MIT
