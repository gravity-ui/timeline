# Events API Reference

The `Events` component is responsible for managing and rendering timeline events. It handles event selection, interaction, and rendering with support for custom event renderers through `AbstractEventRenderer`.

## Overview

```typescript
import { Events } from '@gravity-ui/timeline';

// Events is created internally by the Timeline class
// It's not meant to be instantiated directly
const events = new Events(timeline.api);
```

## Properties

| Property | Type | Description | Visibility |
|----------|------|-------------|------------|
| `allowMultipleSelection` | `boolean` | Whether multiple events can be selected simultaneously | public |
| `activeEvent` | `TimelineEvent \| null` | Currently hovered event | public |
| `index` | [`RBush`](https://github.com/mourner/rbush) | Spatial index for efficient event lookup | protected |
| `api` | `CanvasApi` | API instance for timeline manipulation | private |
| `_selectedEvents` | `Set<string>` | Set of selected event IDs | private |
| `_events` | `Event[]` | Array of all events | private |

## Methods

### `constructor(api: CanvasApi)`

Creates a new Events instance. This constructor is called internally by the Timeline class.

```typescript
// This is handled internally by the Timeline class
const events = new Events(timeline.api);
```

**Parameters:**
- `api`: CanvasApi instance for timeline manipulation

### `setEvents(newEvents: Event[])`

Updates the events data and rebuilds the spatial index.

```typescript
// Update events with new data
events.setEvents([
  {
    id: '1',
    axisId: 'axis1',
    trackIndex: 0,
    from: Date.now(),
    to: Date.now() + 3600000,
    color: '#ff0000'
  }
]);
```

**Parameters:**
- `newEvents`: Array of events to display on the timeline

### `getEventsAt(rect: DOMRect): Event[]`

Finds events that intersect with the given rectangle.

```typescript
// Find events in a specific area
const eventsInArea = events.getEventsAt(new DOMRect(100, 100, 200, 200));
```

**Parameters:**
- `rect`: DOMRect representing the search area

**Returns:**
- Array of events that intersect with the rectangle

### `getEventsAtPoint(x: number, y: number): Event[]`

Finds events at a specific point on the canvas.

```typescript
// Find events at a specific point
const eventsAtPoint = events.getEventsAtPoint(150, 150);
```

**Parameters:**
- `x`: X coordinate
- `y`: Y coordinate

**Returns:**
- Array of events at the specified point

### `setSelectedEvents(ids: string[])`

Updates the set of selected event IDs.

```typescript
// Select specific events by their IDs
events.setSelectedEvents(['1', '2', '3']);
```

**Parameters:**
- `ids`: Array of event IDs to mark as selected

### `getSelectedEvents(): Event[]`

Gets all currently selected events.

```typescript
// Get all selected events
const selectedEvents = events.getSelectedEvents();
```

**Returns:**
- Array of selected events

### `selectEvents(events: Event[], options?: SelectOptions): void`

Selects or deselects events based on provided options.

```typescript
// Select events with options
events.selectEvents([event1, event2], {
  append: true,  // Add to existing selection
  toggle: true   // Toggle selection state
});
```

**Parameters:**
- `events`: Array of events to select/deselect
- `options`: Selection options
  - `append?: boolean` - Add to existing selection
  - `toggle?: boolean` - Toggle selection state
  - `contextmenu?: boolean` - Selection via context menu

### `render()`

Renders all events on the canvas. This method is called automatically during timeline rendering.

```typescript
// This is handled internally
events.render();
```

## Event Structure

Each event in the timeline has the following structure:

```typescript
type TimelineEvent = {
  id: string;              // Unique event identifier
  axisId: string;          // ID of the axis this event belongs to
  trackIndex: number;      // Index of the track within the axis
  from: number;            // Start timestamp
  to?: number;             // Optional end timestamp
  color?: string;          // Optional event color
  selectedColor?: string;  // Optional color when selected
  renderer?: AbstractEventRenderer; // Optional custom renderer
};
```

## Event Renderers

The Events component supports custom event renderers through the `AbstractEventRenderer` class:

```typescript
abstract class AbstractEventRenderer {
  abstract render(
    ctx: CanvasRenderingContext2D,
    event: TimelineEvent,
    isSelected: boolean,
    x0: number,
    x1: number,
    y: number,
    h: number,
    timeToPosition?: (n: number) => number,
    color?: string,
  ): void;

  abstract getHitbox(
    event: TimelineEvent,
    x0: number,
    x1: number,
  ): Hitbox;
}
```

## Examples

### Basic Usage

The Events component is used internally by the Timeline class. Here's how it's typically configured:

```typescript
import { Timeline } from '@gravity-ui/timeline';

// Create timeline instance
const timeline = new Timeline({
  settings: {
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
      to: Date.now() + 1800000,
      color: '#ff0000'
    }]
  },
  viewConfiguration: {
    events: {
      font: '12px Arial',
      hitboxPadding: 4,
      color: {
        default: '#333333',
        selected: '#5469d4'
      }
    }
  }
});

// Initialize with canvas
const canvas = document.querySelector('canvas');
if (canvas instanceof HTMLCanvasElement) {
  timeline.init(canvas);
  // Events are created and rendered automatically
}
```

### Custom Event Renderer

You can create custom event renderers by extending `AbstractEventRenderer`:

```typescript
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
  }

  getHitbox(event: TimelineEvent, x0: number, x1: number): Hitbox {
    return {
      left: x0,
      right: x1,
      top: 0,
      bottom: 0
    };
  }
}

// Use custom renderer
const event = {
  id: '1',
  axisId: 'axis1',
  trackIndex: 0,
  from: Date.now(),
  to: Date.now() + 3600000,
  color: '#ff0000',
  renderer: new CustomEventRenderer()
};
```

## Event Handling

The Events component emits the following events:

1. `on-click`: Emitted when clicking on the canvas
   ```typescript
   {
     events: TimelineEvent[];  // Events at click position
     time: number;            // Click timestamp
     relativeX: number;       // Click X coordinate
     relativeY: number;       // Click Y coordinate
   }
   ```

2. `on-context-click`: Emitted on right-click
   ```typescript
   {
     event?: TimelineEvent;   // Event at click position
     time: number;           // Click timestamp
     relativeX: number;      // Click X coordinate
     relativeY: number;      // Click Y coordinate
   }
   ```

3. `on-hover`: Emitted when hovering over an event
   ```typescript
   {
     event: TimelineEvent;   // Hovered event
     time: number;          // Hover timestamp
     relativeX: number;     // Hover X coordinate
     relativeY: number;     // Hover Y coordinate
   }
   ```