# Timeline API Reference

The `Timeline` class is the core component of the timeline library. It manages the timeline visualization, interactions, and state. It works in conjunction with [TimelineController](./TimelineController.md) for handling user interactions and component interfaces for managing visual components.

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
    camera?: CameraViewOptions;
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
      selectedEventIds?: string[]; // Optional selected events
      clickEventsCollectionFilter?: (candidates: Event[]) => Event[]; // Optional event click filter
      clickMarkerCollectionFilter?: (candidates: Marker[]) => Marker[]; // Optional marker click filter
    };
    viewConfiguration?: {  // Optional view settings
      ruler?: RulerViewOptions;
      grid?: GridViewOptions;
      axes?: AxesViewOptions;
      events?: EventsViewOptions;
      markers?: MarkerViewOptions;
      camera?: CameraViewOptions;
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

## Configuration Options

### Click Collection Filters

The `clickEventsCollectionFilter` and `clickMarkerCollectionFilter` options provide powerful filtering capabilities for controlling which events or markers can be selected when users interact with the timeline. These filters are called whenever the user clicks on the timeline, allowing you to implement custom business logic and selection rules.

#### Configuration

Both filters accept an array of candidate items at the click position and return a filtered array:

```typescript
const timeline = new Timeline({
  settings: {
    // ... other settings
    clickEventsCollectionFilter?: (candidates: TimelineEvent[]) => TimelineEvent[];
    clickMarkerCollectionFilter?: (candidates: TimelineMarker[]) => TimelineMarker[];
  }
});
```

#### Event Filter Examples

```typescript
// Filter based on event properties
clickEventsCollectionFilter: (candidates) => {
  // Only allow selection of events with priority "high"
  return candidates.filter(event => event.priority === 'high');
},

// Only select events from specific axes
clickEventsCollectionFilter: (candidates) => 
  candidates.filter(event => ['axis1', 'axis2'].includes(event.axisId)),

// Select only the topmost event (first in array)
clickEventsCollectionFilter: (candidates) => 
  candidates.length > 0 ? [candidates[0]] : [],

// Filter based on user permissions
clickEventsCollectionFilter: (candidates) => 
  candidates.filter(event => event.userCanEdit),

// Apply complex business logic
clickEventsCollectionFilter: (candidates) => {
  return candidates.filter(event => {
    return event.status === 'active' && 
           !event.locked && 
           event.department === getCurrentUserDepartment();
  });
}
```

#### Marker Filter Examples

```typescript
// Only select the first marker (avoid multi-selection)
clickMarkerCollectionFilter: (candidates) => 
  candidates.length > 0 ? [candidates[0]] : [],

// Filter based on marker groups
clickMarkerCollectionFilter: (candidates) => 
  candidates.filter(marker => !marker.group),

// Filter based on custom properties
clickMarkerCollectionFilter: (candidates) => 
  candidates.filter(marker => marker.userCanInteract),

// Select markers with specific labels only
clickMarkerCollectionFilter: (candidates) => 
  candidates.filter(marker => marker.label && marker.label.includes('Important')),

// Filter non-selectable markers
clickMarkerCollectionFilter: (candidates) => {
  return candidates.filter(marker => !marker.nonSelectable);
}
```

#### Common Use Cases

- **Permission-based filtering**: Filter events/markers based on user roles or permissions
- **Single-selection enforcement**: Always return only one item to prevent multi-selection
- **Type-based filtering**: Filter by event/marker types, categories, or custom properties
- **Interactive state control**: Prevent selection of locked, disabled, or read-only items
- **Business rule enforcement**: Apply domain-specific rules to selection behavior
- **UI/UX optimization**: Implement selection logic that improves user experience

#### Filter Execution Order

When both events and markers exist at a click position:
1. Events are filtered using `clickEventsCollectionFilter` (if provided)
2. Markers are filtered using `clickMarkerCollectionFilter` (if provided)  
3. The filtered results are used for selection and event emission

> **Note:** For detailed documentation on event and marker filtering, see [Events.md](./Events.md#click-filtering) and [Markers.md](./Markers.md#click-filtering) respectively.

### Camera Configuration

The `camera` configuration controls timeline interaction behaviors, particularly zooming and panning:

```typescript
viewConfiguration: {
  camera: {
    zoom: ZoomMode.DEFAULT // or ZoomMode.NONE or ZoomMode.HORIZONTAL
  }
}
```

**Zoom Modes:**

| Mode | Value | Behavior |
|------|-------|----------|
| `DEFAULT` | `"default"` | Standard zoom and pan behavior (mouse wheel zooms, Shift+wheel pans vertically) |
| `HORIZONTAL` | `"horizontal"` | Mouse wheel pans horizontally without requiring Shift key |
| `NONE` | `"none"` | Disables all zoom and pan interactions |

## Events

The timeline emits the following events:

### `on-click`
Triggered when clicking on the timeline.
```typescript
{
  events: TimelineEvent[];  // Events at click position (after filtering)
  markers: TimelineMarker[]; // Markers at click position (after filtering)
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
import { Timeline, ZoomMode } from '@gravity-ui/timeline';

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
  },
  viewConfiguration: {
    camera: {
      zoom: ZoomMode.DEFAULT
    }
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
  console.log('Clicked markers:', data.markers);
});

// Clean up
timeline.destroy();
```

### Timeline with Click Filters

```typescript
import { Timeline, ZoomMode } from '@gravity-ui/timeline';

// Create timeline with custom click filtering
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
    events: [
      {
        id: 'event1',
        from: Date.now() + 1800000,
        to: Date.now() + 2400000,
        label: 'High Priority Event',
        axisId: 'main',
        trackIndex: 0,
        priority: 'high',
        userCanEdit: true
      },
      {
        id: 'event2',
        from: Date.now() + 900000,
        to: Date.now() + 1800000,
        label: 'Low Priority Event',
        axisId: 'main',
        trackIndex: 1,
        priority: 'low',
        userCanEdit: false
      }
    ],
    markers: [
      {
        time: Date.now() + 2100000,
        label: 'Important Deadline',
        color: '#ff0000',
        nonSelectable: false
      },
      {
        time: Date.now() + 2700000,
        label: 'Internal Note',
        color: '#cccccc',
        nonSelectable: true
      }
    ],
    // Filter events: only allow high-priority, editable events
    clickEventsCollectionFilter: (candidates) => {
      return candidates.filter(event => 
        event.priority === 'high' && event.userCanEdit
      );
    },
    // Filter markers: exclude non-selectable markers
    clickMarkerCollectionFilter: (candidates) => {
      return candidates.filter(marker => !marker.nonSelectable);
    }
  },
  viewConfiguration: {
    camera: {
      zoom: ZoomMode.DEFAULT
    }
  }
});

// Initialize and handle filtered clicks
const canvas = document.querySelector('canvas');
if (canvas instanceof HTMLCanvasElement) {
  timeline.init(canvas);
}

timeline.on('on-click', (data) => {
  // Only filtered events/markers will be in the data
  console.log('Selectable events:', data.events); // Only high-priority, editable events
  console.log('Selectable markers:', data.markers); // Only selectable markers
});
```

### Event Handling

```typescript
// Add multiple event listeners
timeline.on('on-click', (data) => {
  console.log('Clicked events:', data.events);
  console.log('Clicked markers:', data.markers);
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
    activeColor: '#ff5252',
    hoverColor: '#ff1744',
    label: 'Important Point'
  }
]);
``` 