# CanvasApi API Reference

The `CanvasApi` class provides a high-level API for managing the timeline canvas, its components, and rendering. It serves as the main interface between the Timeline class and its visual components, which implement `BaseComponentInterface`.

## Overview

```typescript
import { CanvasApi } from '@gravity-ui/timeline';

// CanvasApi is created internally by the Timeline class
// It's not meant to be instantiated directly
const api = timeline.api;
```

## Properties

| Property | Type | Description | Visibility |
|----------|------|-------------|------------|
| `canvas` | `HTMLCanvasElement` | The canvas element used for rendering | public readonly |
| `ctx` | `CanvasRenderingContext2D` | The canvas 2D rendering context | public readonly |
| `components` | `Map<ComponentType, BaseComponentInterface>` | Map of timeline components | protected |
| `timeline` | `Timeline` | Reference to the parent Timeline instance | protected |

## Methods

### Component Management

#### `addComponent(key: ComponentType, component: BaseComponentInterface)`

Adds a new component to the timeline.

```typescript
api.addComponent(ComponentType.Events, new Events(api));
```

**Parameters:**
- `key`: Component identifier
- `component`: Component instance implementing BaseComponentInterface

#### `removeComponent(key: string)`

Removes a component from the timeline.

```typescript
api.removeComponent(ComponentType.Events);
```

**Parameters:**
- `key`: Component identifier to remove

#### `getComponent<T>(key: string): T`

Gets a component instance by its key.

```typescript
const events = api.getComponent<Events>(ComponentType.Events);
```

**Parameters:**
- `key`: Component identifier

**Returns:**
- Component instance of type T

### Rendering

#### `rerender(clearBeforeRender = true)`

Triggers a re-render of all timeline components.

```typescript
// Re-render with clearing
api.rerender();

// Re-render without clearing
api.rerender(false);
```

**Parameters:**
- `clearBeforeRender`: Whether to clear the canvas before rendering (default: true)

#### `clear()`

Clears the entire canvas.

```typescript
api.clear();
```

#### `useStaticTransform()`

Applies static transform to the canvas context (for fixed elements).

```typescript
api.useStaticTransform();
```

#### `useScrollTransform()`

Applies scroll transform to the canvas context (for scrollable elements).

```typescript
api.useScrollTransform();
```

### Timeline Management

#### `setRange(start: number, end: number)`

Updates the timeline's visible range.

```typescript
api.setRange(
  Date.now(),
  Date.now() + 3600000 // 1 hour
);
```

**Parameters:**
- `start`: Start timestamp
- `end`: End timestamp

#### `setAxes<Axis extends TimelineAxis>(newAxes: Axis[])`

Updates the timeline axes.

```typescript
api.setAxes([
  {
    id: 'main',
    tracksCount: 3,
    top: 0,
    height: 100
  }
]);
```

**Parameters:**
- `newAxes`: Array of axis configurations

#### `setEvents(events: TimelineEvent[])`

Updates the timeline events.

```typescript
api.setEvents([
  {
    id: 'event1',
    from: Date.now(),
    to: Date.now() + 1800000,
    axisId: 'main',
    trackIndex: 0
  }
]);
```

**Parameters:**
- `events`: Array of event configurations

#### `setMarkers(markers: TimelineMarker[])`

Updates the timeline markers.

```typescript
api.setMarkers([
  {
    time: Date.now() + 1800000,
    color: '#ff0000',
    label: 'Important Point'
  }
]);
```

**Parameters:**
- `markers`: Array of marker configurations

#### `setSelectedEvents(ids: string[])`

Updates the selection state of events.

```typescript
api.setSelectedEvents(['event1', 'event2']);
```

**Parameters:**
- `ids`: Array of event IDs to select

### Utility Methods

#### `timeToPosition(t: number): number`

Converts a timestamp to canvas x-coordinate.

```typescript
const x = api.timeToPosition(Date.now());
```

**Parameters:**
- `t`: Timestamp to convert

**Returns:**
- X-coordinate in pixels

#### `positionToTime(px: number): number`

Converts a canvas x-coordinate to timestamp.

```typescript
const time = api.positionToTime(100);
```

**Parameters:**
- `px`: X-coordinate in pixels

**Returns:**
- Timestamp

#### `widthToTime(px: number): number`

Converts a width in pixels to time duration.

```typescript
const duration = api.widthToTime(200);
```

**Parameters:**
- `px`: Width in pixels

**Returns:**
- Duration in milliseconds

### Getters

| Getter | Type | Description |
|--------|------|-------------|
| `pixelRatio` | `number` | Current device pixel ratio |
| `canvasScrollTop` | `number` | Current vertical scroll position |
| `width` | `number` | Canvas width in logical pixels |
| `height` | `number` | Canvas height in logical pixels |
| `currentTime` | `number` | Current timestamp (aligned to seconds) |
| `emit` | `Function` | Event emitter function |
| `getInterval()` | `{ start: number; end: number }` | Current timeline range |
| `getVisualConfiguration()` | `ViewConfigurationDefault` | Current view configuration |
| `getTimelineSettings()` | `TimelineSettings` | Current timeline settings |

## Examples

### Basic Timeline Setup

```typescript
import { Timeline } from '@gravity-ui/timeline';

// Create timeline instance
const timeline = new Timeline({
  settings: {
    start: Date.now(),
    end: Date.now() + 3600000,
    axes: [],
    events: []
  }
});

// Initialize with canvas
const canvas = document.querySelector('canvas');
if (canvas instanceof HTMLCanvasElement) {
  timeline.init(canvas);
  
  // Access CanvasApi through timeline
  const api = timeline.api;
  
  // Update timeline range
  api.setRange(
    Date.now(),
    Date.now() + 7200000 // 2 hours
  );
  
  // Add events
  api.setEvents([
    {
      id: 'event1',
      from: Date.now(),
      to: Date.now() + 1800000,
      axisId: 'main',
      trackIndex: 0
    }
  ]);
}
```

### Custom Component Integration

```typescript
// Create custom component
class CustomComponent implements BaseComponentInterface {
  constructor(private api: CanvasApi) {}
  
  render() {
    const { ctx, width, height } = this.api;
    // Custom rendering logic
  }
}

// Add custom component to timeline
const api = timeline.api;
api.addComponent('custom', new CustomComponent(api));

// Re-render with custom component
api.rerender();
```

### Event Handling with CanvasApi

```typescript
const api = timeline.api;

// Listen for timeline events
api.emit('on-click', {
  events: [],
  time: Date.now(),
  relativeX: 100,
  relativeY: 50
});

// Update selection
api.setSelectedEvents(['event1']);

// Get current timeline state
const { start, end } = api.getInterval();
const settings = api.getTimelineSettings();
const config = api.getVisualConfiguration();
```

## Implementation Details

### Canvas Context Management

The CanvasApi manages the canvas context and its transformations:

```typescript
// Initialize context
this.ctx = this.canvas.getContext('2d');
this.ctx.globalAlpha = 1.0;

// Apply transforms
this.ctx.save();
// ... rendering operations
this.ctx.restore();
```

### Component Lifecycle

Components are managed through a Map and can be added/removed dynamically:

```typescript
// Add component
this.components.set(key, component);

// Remove component
this.components.delete(key);

// Clean up
this.components.forEach((component) => {
  component?.destroy?.();
});
```

### Coordinate System

The API provides methods for converting between time and screen coordinates:

```typescript
// Time to position
const x = convertDomain(
  time,
  start,
  end,
  0,
  width
);

// Position to time
const time = convertDomain(
  x,
  0,
  width,
  start,
  end
);
```