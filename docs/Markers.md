# Markers API Reference

The `Markers` component is responsible for rendering timeline markers on the canvas. It handles vertical marker lines, labels, and their positioning with collision avoidance.

## Overview

```typescript
import { Markers } from '@gravity-ui/timeline';

// Markers is created internally by the Timeline class
// It's not meant to be instantiated directly
const markers = new Markers(timeline.api);
```

## Properties

| Property | Type | Description | Visibility |
|----------|------|-------------|------------|
| `api` | `CanvasApi` | API instance for timeline manipulation | protected |
| `sortedMarkers` | `TimelineMarker[]` | Array of markers sorted by time | protected |
| `lastRenderedLabelPosition` | `{ top: number, bottom: number }` | Tracks last rendered label positions to prevent overlapping | protected |
| `textWidthCache` | `Map<string, number>` | Cache for label text widths | private |

## Methods

### `constructor(api: CanvasApi)`

Creates a new Markers instance. This constructor is called internally by the Timeline class.

```typescript
// This is handled internally by the Timeline class
const markers = new Markers(timeline.api);
```

**Parameters:**
- `api`: CanvasApi instance for timeline manipulation

### `setMarkers(markers: TimelineMarker[])`

Updates markers data and triggers re-render.

```typescript
// Update markers with new data
markers.setMarkers([
  {
    time: Date.now(),
    color: '#ff0000',
    label: 'Important Event',
    width: 2
  },
  {
    time: Date.now() + 3600000,
    color: '#00ff00',
    labelBottom: 'Next Event',
    labelBottomBackgroundColor: '#e0e0e0'
  }
]);
```

**Parameters:**
- `markers`: Array of timeline markers to display

### `render()`

Renders all visible markers within the current viewport. This method is called automatically during timeline rendering.

```typescript
// This is handled internally
markers.render();
```

**Rendering Process:**
1. Applies static transform to the canvas context
2. Resets label positions for new render pass
3. Renders markers in reverse order for proper label placement
4. Handles label collision avoidance
5. Applies visual configuration (colors, fonts, etc.)

## Marker Structure

Each marker in the timeline has the following structure:

```typescript
type TimelineMarker = {
  time: number;                    // Timestamp for the marker
  color: string;                   // Color of the marker line
  width?: number;                  // Optional width of the marker line
  label?: string;                  // Optional top label text
  labelBackgroundColor?: string;   // Optional background color for top label
  labelTextColor?: string;         // Optional text color for top label
  labelBottom?: string;            // Optional bottom label text
  labelBottomBackgroundColor?: string; // Optional background color for bottom label
  labelBottomTextColor?: string;   // Optional text color for bottom label
};
```

## Examples

### Basic Usage

The Markers component is used internally by the Timeline class. Here's how it's typically used:

```typescript
import { Timeline } from '@gravity-ui/timeline';

// Create timeline instance
const timeline = new Timeline({
  settings: {
    start: Date.now(),
    end: Date.now() + 3600000,
    axes: [],
    events: [],
    markers: [
      {
        time: Date.now(),
        color: '#ff0000',
        label: 'Start'
      }
    ]
  },
  viewConfiguration: {
    markers: {
      markerWidth: 1,
      labelHeight: 24,
      labelPadding: 8,
      labelFont: '12px Arial',
      textPadding: 16,
      color: {
        textColor: '#ffffff'
      }
    }
  }
});

// Initialize with canvas
const canvas = document.querySelector('canvas');
if (canvas instanceof HTMLCanvasElement) {
  timeline.init(canvas);
  // Markers are created and rendered automatically
}
```

### Custom Marker Configuration

You can customize the appearance of markers through the view configuration:

```typescript
const timeline = new Timeline({
  settings: {
    start: Date.now(),
    end: Date.now() + 3600000,
    axes: [],
    events: [],
    markers: [
      {
        time: Date.now(),
        color: '#ff0000',
        label: 'Custom Marker',
        width: 2,
        labelBackgroundColor: '#e0e0e0',
        labelTextColor: '#000000'
      }
    ]
  },
  viewConfiguration: {
    markers: {
      // Customize marker appearance
      markerWidth: 2,
      labelHeight: 32,
      labelPadding: 12,
      labelFont: '14px Arial',
      textPadding: 20,
      color: {
        textColor: '#000000'
      }
    }
  }
});
```

## Implementation Details

### Label Collision Avoidance

The Markers component implements a right-to-left rendering strategy for labels to prevent overlapping:

```typescript
protected renderLabel(
  markerPosition: number,
  {
    label,
    backgroundColor,
    textColor,
  }: { label: string; backgroundColor: string; textColor?: string },
  position: "top" | "bottom",
) {
  const { markers } = this.api.getVisualConfiguration();
  const ctx = this.api.ctx;
  const labelWidth = this.getLabelWidth(label);

  // Calculate label position with clamping
  const labelPosition = clamp(
    markerPosition - labelWidth / 2,
    0,
    Math.min(ctx.canvas.width, this.lastRenderedLabelPosition[position]) - labelWidth
  );

  // Only render if we have space
  if (markerPosition < this.lastRenderedLabelPosition[position]) {
    // Draw label background and text
    // ...
  }
}
```

### Text Width Caching

The component caches text widths for better performance:

```typescript
protected getLabelWidth(text: string) {
  if (this.textWidthCache.has(text)) {
    return this.textWidthCache.get(text);
  }

  const { markers } = this.api.getVisualConfiguration();
  const width = this.api.ctx.measureText(text).width + markers.labelPadding * 2;
  this.textWidthCache.set(text, width);
  return width;
}
```

### Marker Rendering

Markers are rendered with support for both top and bottom labels:

```typescript
protected renderMarker(marker: TimelineMarker) {
  const { markers } = this.api.getVisualConfiguration();
  const ctx = this.api.ctx;
  const markerPosition = this.api.timeToPosition(marker.time);

  // Draw marker line
  ctx.strokeStyle = marker.color;
  ctx.lineWidth = marker.width ?? markers.markerWidth;
  ctx.beginPath();
  ctx.moveTo(markerPosition, marker.label ? markers.labelHeight : 0);
  ctx.lineTo(markerPosition, ctx.canvas.height);
  ctx.stroke();

  // Render labels if present
  if (marker.label) {
    this.renderLabel(/* ... */);
  }
  if (marker.labelBottom) {
    this.renderLabel(/* ... */);
  }
}
```

## Best Practices

1. **Marker Configuration**
   - Use meaningful labels
   - Choose appropriate colors for visibility
   - Consider marker width based on importance

2. **Label Management**
   - Keep labels concise
   - Use consistent styling
   - Consider using bottom labels for dense timelines

3. **Performance**
   - Minimize the number of markers
   - Use the text width cache effectively
   - Consider marker density in the viewport 