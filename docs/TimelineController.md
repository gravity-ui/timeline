# TimelineController API Reference

The `TimelineController` class is responsible for handling timeline interactions and canvas resizing. It manages zoom, pan, and canvas size updates.

## Overview

```typescript
import { TimelineController } from '@gravity-ui/timeline';

// TimelineController is created internally by the Timeline class
// It's not meant to be instantiated directly
const controller = new TimelineController(timeline.api);
```

## Properties

| Property | Type | Description | Visibility |
|----------|------|-------------|------------|
| `api` | `CanvasApi` | API instance for timeline manipulation | public |

## Methods

### `constructor(api: CanvasApi)`

Creates a new TimelineController instance. This constructor is called internally by the Timeline class.

```typescript
// This is handled internally by the Timeline class
const controller = new TimelineController(timeline.api);
```

**Parameters:**
- `api`: CanvasApi instance for timeline manipulation

### `init()`

Initializes event listeners for window resize and canvas wheel events. This method is called automatically by the constructor.

```typescript
// This is handled internally
controller.init();
```

**Sets up listeners for:**
- Window resize events
- Canvas wheel events for zoom and pan

### `destroy()`

Cleans up event listeners when the controller is destroyed. This method should be called when the timeline is no longer needed.

```typescript
// This is handled internally by Timeline.destroy()
controller.destroy();
```

## Interaction Features

The TimelineController provides the following interaction capabilities:

### Zoom

- **Mouse Wheel**: Zoom in/out centered on cursor position
- **Zoom Limits**: 
  - Minimum zoom: 5 seconds
  - Maximum zoom: 2 months
- **Zoom Speed**: Controlled by wheel delta

### Pan

- **Shift + Wheel**: Vertical panning
- **Wheel Delta X**: Horizontal panning
- **Pan Speed**: Controlled by `WHEEL_PAN_SPEED` constant (0.00025)

### Canvas Resizing

- Automatically handles window resize events
- Updates canvas dimensions based on container size
- Maintains proper pixel ratio for high DPI displays
- Triggers re-render after size updates

## Examples

### Basic Usage

The TimelineController is used internally by the Timeline class. Here's how it's typically used:

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
  // TimelineController is created and initialized automatically
}

// Clean up
timeline.destroy(); // This will also destroy the TimelineController
```

### Custom Interaction Handling

While the TimelineController handles basic interactions automatically, you can extend its functionality by listening to timeline events:

```typescript
// Listen for timeline range changes
timeline.on('on-range-change', (data) => {
  const { start, end } = data;
  console.log('Timeline range changed:', {
    start: new Date(start),
    end: new Date(end)
  });
});

// Listen for canvas size changes
timeline.on('on-resize', (data) => {
  const { width, height } = data;
  console.log('Canvas size changed:', { width, height });
});
```

## Implementation Details

### Zoom Calculation

The zoom level is calculated based on the wheel delta and current domain:

```typescript
const factor = event.deltaY > 0 ? 1.15 : 0.9;
const newDomain = clamp(oldDomain * factor, ZOOM_MIN, ZOOM_MAX);
```

### Pan Calculation

Pan distance is calculated using the wheel delta and current domain:

```typescript
const shift = oldDomain * event.deltaY * WHEEL_PAN_SPEED;
newStart += shift;
newEnd += shift;
```

### Canvas Size Update

Canvas size is updated based on container dimensions and device pixel ratio:

```typescript
const pixelRatio = window.devicePixelRatio || 1;
canvas.width = Math.floor(canvas.offsetWidth * pixelRatio);
canvas.height = Math.floor(canvas.offsetHeight * pixelRatio);
``` 