# Axes API Reference

The `Axes` component is responsible for managing and rendering timeline axes. It provides functionality for displaying multiple axes with tracks, handling axis positioning, and managing axis data using [AxesIndex](./AxesIndex.md) for efficient lookup.

## Overview

```typescript
import { Axes } from '@gravity-ui/timeline';

// Axes is created internally by the Timeline class
// It's not meant to be instantiated directly
const axes = new Axes(timeline.api);
```

## Properties

| Property | Type | Description | Visibility |
|----------|------|-------------|------------|
| `strokeMode` | `StrokeMode` | Mode for rendering axis lines (STRAIGHT or DASHED) | public |
| `api` | `CanvasApi` | API instance for timeline manipulation | private |
| `axesIndex` | [`AxesIndex`](./AxesIndex.md)`<Axis>` | Index for efficient axis lookup and management | private |

## Methods

### `constructor(api: CanvasApi)`

Creates a new Axes instance. This constructor is called internally by the Timeline class.

```typescript
// This is handled internally by the Timeline class
const axes = new Axes(timeline.api);
```

**Parameters:**
- `api`: CanvasApi instance for timeline manipulation

### `setAxes(newAxes: Axis[])`

Replaces all axes with a new set and triggers re-render.

```typescript
// Update axes with new data
axes.setAxes([
  {
    id: 'axis1',
    tracksCount: 3,
    top: 0,
    height: 100
  },
  {
    id: 'axis2',
    tracksCount: 2,
    top: 120,
    height: 80
  }
]);
```

**Parameters:**
- `newAxes`: Array of new axes to display

**Throws:**
- Error if newAxes is not an array

### `getAxesById(): Record<string, Axis>`

Gets all axes indexed by their ID for quick lookup.

```typescript
// Get axis by ID
const axisById = axes.getAxesById();
const axis1 = axisById['axis1'];
```

**Returns:**
- Record mapping axis IDs to axis objects

### `getAxisTrackPosition(axis: Axis, trackIndex: number): number`

Calculates vertical position for a track within an axis.

```typescript
// Get position of track 1 in axis1
const trackPosition = axes.getAxisTrackPosition(axis1, 1);
```

**Parameters:**
- `axis`: Axis containing the track
- `trackIndex`: Index of the track within the axis

**Returns:**
- Y coordinate of the track's center

**Throws:**
- Error if axis is invalid or trackIndex is out of bounds

### `render()`

Renders all axes to the canvas. This method is called automatically during timeline rendering.

```typescript
// This is handled internally
axes.render();
```

**Rendering Process:**
1. Applies scroll transform to the canvas context
2. Sets up line style based on strokeMode
3. Renders horizontal lines for each track in each axis
4. Applies visual configuration (colors, line width, etc.)

## Axis Structure

Each axis in the timeline has the following structure:

```typescript
type TimelineAxis = {
  id: string;           // Unique identifier for the axis
  tracksCount: number;  // Number of tracks in the axis
  top: number;         // Vertical position of the axis
  height: number;      // Height of the axis
};
```

## Examples

### Basic Usage

The Axes component is used internally by the Timeline class. Here's how it's typically used:

```typescript
import { Timeline } from '@gravity-ui/timeline';

// Create timeline instance
const timeline = new Timeline({
  settings: {
    start: Date.now(),
    end: Date.now() + 3600000,
    axes: [
      {
        id: 'main',
        tracksCount: 3,
        top: 0,
        height: 100
      }
    ],
    events: []
  },
  viewConfiguration: {
    axes: {
      trackHeight: 30,
      lineWidth: 1,
      color: {
        line: '#e0e0e0'
      },
      dashedLinePattern: [5, 5],
      solidLinePattern: []
    }
  }
});

// Initialize with canvas
const canvas = document.querySelector('canvas');
if (canvas instanceof HTMLCanvasElement) {
  timeline.init(canvas);
  // Axes are created and rendered automatically
}
```

### Custom Axis Configuration

You can customize the appearance of axes through the view configuration:

```typescript
const timeline = new Timeline({
  settings: {
    start: Date.now(),
    end: Date.now() + 3600000,
    axes: [
      {
        id: 'custom',
        tracksCount: 4,
        top: 0,
        height: 120
      }
    ],
    events: []
  },
  viewConfiguration: {
    axes: {
      // Customize axis appearance
      trackHeight: 40,
      lineWidth: 2,
      color: {
        line: '#b0b0b0'
      },
      dashedLinePattern: [8, 4],
      solidLinePattern: []
    }
  }
});
```

## Implementation Details

### Axis Indexing

The Axes component uses an AxesIndex for efficient axis management:

```typescript
private axesIndex: AxesIndex<Axis>;

constructor(api: CanvasApi) {
  this.api = api;
  this.axesIndex = new AxesIndex<Axis>([], {
    identityFunction: (axis: Axis) => axis.id,
  });
}
```

### Track Position Calculation

Track positions are calculated based on the axis configuration and visual settings:

```typescript
public getAxisTrackPosition(axis: Axis, trackIndex: number): number {
  if (!axis || axis.tracksCount < 0) {
    throw new Error("Invalid axis configuration");
  }

  const { axes } = this.api.getVisualConfiguration();
  const index = clamp(trackIndex, 0, axis.tracksCount - 1);
  return axis.top + axes.trackHeight * index + axes.trackHeight / 2;
}
```

### Rendering Process

The rendering process handles both straight and dashed line modes:

```typescript
public render() {
  const { ruler, axes } = this.api.getVisualConfiguration();
  const { ctx } = this.api;

  // Set line style based on mode
  if (this.strokeMode === StrokeMode.DASHED) {
    ctx.setLineDash(axes.dashedLinePattern);
  }

  // Apply scroll transform and ruler offset
  this.api.useScrollTransform();
  ctx.translate(0, ruler.height);

  // Render tracks for each axis
  ctx.strokeStyle = axes.color.line;
  ctx.beginPath();
  ctx.lineWidth = axes.lineWidth;

  for (const axis of this.axesIndex.sortedAxes) {
    for (let i = 0; i < axis.tracksCount; i += 1) {
      const y = this.getAxisTrackPosition(axis, i);
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
    }
  }

  ctx.stroke();
  ctx.setLineDash(axes.solidLinePattern);
}
```

## Best Practices

1. **Axis Configuration**
   - Use meaningful IDs for axes
   - Set appropriate track counts based on your data
   - Consider axis heights when planning layout

2. **Visual Customization**
   - Choose appropriate line styles (straight/dashed)
   - Set track heights based on content
   - Use consistent colors across related axes

3. **Performance**
   - Minimize the number of axes when possible
   - Use appropriate track counts
   - Consider using dashed lines sparingly 