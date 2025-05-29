# Timeline API Reference

The `Timeline` class is the core component of the timeline library. It manages the timeline visualization, interactions, and state. It works in conjunction with [TimelineController](./TimelineController.md) for handling user interactions and [BaseComponentInterface](./BaseComponentInterface.md) for managing visual components.

## Overview

```typescript
import { Timeline } from '@gravity-ui/timeline';

const timeline = new Timeline({
  settings: {
    start: number;
    end: number;
    axes: TimelineAxis[];
    events: TimelineEvent[];
    markers?: TimelineMarker[];
  },
  viewConfiguration?: {
    ruler?: RulerViewOptions;
    grid?: GridViewOptions;
    axes?: AxesViewOptions;
    events?: EventsViewOptions;
    markers?: MarkerViewOptions;
    hideRuler?: boolean;
  }
});
```

## Properties

| Property | Type | Description | Visibility |
|----------|------|-------------|------------|
| `settings` | `TimelineSettings` | Current timeline settings including start/end times, axes, events, and markers | public |
| `viewConfiguration` | `ViewConfigurationDefault` | Current view configuration for timeline appearance | public |
| `api` | `CanvasApi` | API for timeline manipulation and component management | public |
| `canvasScrollTop` | `number` | Current vertical scroll position of the canvas | private |
| `eventEmitter` | `EventTarget` | Event emitter for timeline events | private |
| `canvas` | `HTMLCanvasElement` | The canvas element used for rendering | private |
| `state` | `TimelineState` | Current state of the timeline (INIT or READY) | private |
| `controller` | `TimelineController` | Controller for handling timeline interactions | private |

## Methods

### `constructor(config: TimeLineConfig)`

Creates a new Timeline instance.

```typescript
const timeline = new Timeline({
  settings: {
    start: Date.now(),
    end: Date.now() + 3600000,
    axes: [],
    events: []
  }
});
```

**Parameters:**
- `config`: Timeline configuration object
  ```typescript
  type TimeLineConfig = {
    settings: {
      start: number;      // Start time
      end: number;        // End time
      axes: TimelineAxis[];    // Axis configurations
      events: TimelineEvent[]; // Event configurations
      markers?: TimelineMarker[]; // Optional markers
    };
    viewConfiguration?: {  // Optional view settings
      ruler?: RulerViewOptions;
      grid?: GridViewOptions;
      axes?: AxesViewOptions;
      events?: EventsViewOptions;
      markers?: MarkerViewOptions;
      hideRuler?: boolean;
    };
  };
  ```

### `init(canvas: HTMLCanvasElement)`

Initializes the timeline with a canvas element. Sets up components, axes, events, and markers.

```typescript
const canvas = document.querySelector('canvas');
timeline.init(canvas);
```

**Parameters:**
- `canvas`: HTML canvas element to render the timeline on

**Throws:**
- `Error` if the provided canvas is invalid or not an HTMLCanvasElement

### `destroy()`

Destroys the timeline instance, cleaning up all resources and event listeners.

```typescript
// Clean up when component unmounts
timeline.destroy();
```

### `on<EventName>(type: EventName, listener: ApiEvent[EventName], options?: boolean | AddEventListenerOptions)`

Adds an event listener to the timeline.

```typescript
timeline.on('eventClick', (detail) => {
  console.log('Event clicked:', detail);
});
```

**Parameters:**
- `type`: The event type to listen for
- `listener`: The callback function that will be called when the event occurs
- `options`: Optional event listener options

**Generic Parameters:**
- `EventName`: The type of event to listen for, must be a key of ApiEvent
- `Cb`: The callback function type, must match the event type in ApiEvent

### `off<EventName>(type: EventName, listener: ApiEvent[EventName], options?: boolean | EventListenerOptions)`

Removes an event listener from the timeline.

```typescript
const handler = (detail) => console.log(detail);
timeline.on('eventClick', handler);
// Later...
timeline.off('eventClick', handler);
```

**Parameters:**
- `type`: The event type to remove the listener from
- `listener`: The callback function to remove
- `options`: Optional event listener options

### `emit<EventName>(type: EventName, detail?: EventParams)`

Emits an event to all registered listeners.

```typescript
timeline.emit('eventClick', { eventId: '123', time: Date.now() });
```

**Parameters:**
- `type`: The event type to emit
- `detail`: Optional data to pass with the event

**Returns:**
- The created CustomEvent instance

## Events

The timeline emits the following events:

### `on-click`
Triggered when clicking on the timeline.
```typescript
{
  events: TimelineEvent[];
  time: number;
  relativeX: number;
  relativeY: number;
}
```

### `on-context-click`
Triggered on right-click/context menu.
```typescript
{
  event?: TimelineEvent;
  time: number;
  relativeX: number;
  relativeY: number;
}
```

### `on-select-change`
Fired when selection changes.
```typescript
{
  events: TimelineEvent[];
}
```

### `on-hover`
Triggered when hovering over timeline elements.
```typescript
{
  event: TimelineEvent;
  time: number;
  relativeX: number;
  relativeY: number;
}
```

### `on-leave`
Fired when mouse leaves timeline elements.
```typescript
{
  event: TimelineEvent;
}
```

## Examples

### Basic Timeline Setup

```typescript
import { Timeline } from '@gravity-ui/timeline';

// Create timeline instance
const timeline = new Timeline({
  settings: {
    start: Date.now(),
    end: Date.now() + 3600000,
    axes: [{
      id: 'main',
      tracksCount: 3,
      top: 0,
      height: 100
    }],
    events: [{
      id: 'event1',
      from: Date.now() + 1800000,
      to: Date.now() + 2400000,
      label: 'Sample Event',
      axisId: 'main',
      trackIndex: 0
    }]
  }
});

// Initialize with canvas
const canvas = document.querySelector('canvas');
if (canvas instanceof HTMLCanvasElement) {
  timeline.init(canvas);
}

// Add event listeners
timeline.on('on-click', (data) => {
  console.log('Clicked events:', data.events);
});

// Clean up
timeline.destroy();
```

### Event Handling

```typescript
// Add multiple event listeners
timeline.on('on-click', (data) => {
  console.log('Clicked events:', data.events);
});

timeline.on('on-select-change', (data) => {
  console.log('Selected events:', data.events);
});

timeline.on('on-hover', (data) => {
  console.log('Hovered event:', data.event);
});

// Remove specific listener
const clickHandler = (data) => console.log(data);
timeline.on('on-click', clickHandler);
timeline.off('on-click', clickHandler);
```

### Timeline Control

```typescript
// Update timeline range
timeline.api.setRange(
  Date.now(),
  Date.now() + 7200000 // 2 hours
);

// Update events
timeline.api.setEvents([
  {
    id: 'newEvent',
    from: Date.now(),
    to: Date.now() + 3600000,
    label: 'New Event',
    axisId: 'main',
    trackIndex: 0
  }
]);

// Update axes
timeline.api.setAxes([
  {
    id: 'newAxis',
    tracksCount: 2,
    top: 0,
    height: 80
  }
]);

// Update markers
timeline.api.setMarkers([
  {
    time: Date.now() + 1800000,
    color: '#ff0000',
    label: 'Important Point'
  }
]);
``` 