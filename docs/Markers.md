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
| `_sortedMarkers` | `TimelineMarker[]` | Array of markers sorted by time | protected |
| `_collapsedMarkers` | `TimelineMarker[]` | Array of collapsed/grouped markers | protected |
| `index` | `RBush` | Spatial index for efficient marker queries | protected |
| `lastRenderedLabelPosition` | `{ top: number, bottom: number }` | Tracks last rendered label positions to prevent overlapping | protected |
| `textWidthCache` | `Map<string, LabelSize>` | Cache for label text dimensions | private |
| `_selectedMarkers` | `Set<number>` | Set of selected marker times | private |
| `hoveredMarker` | `number` | Currently hovered marker time | private |

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
    activeColor: '#ff5252',
    hoverColor: '#ff1744',
    label: 'Important Event',
    lineWidth: 2
  },
  {
    time: Date.now() + 3600000,
    color: '#00ff00',
    activeColor: '#4caf50',
    hoverColor: '#2e7d32',
    label: 'Next Event'
  }
]);
```

**Parameters:**
- `markers`: Array of timeline markers to display

### `getMarkersAt(rect: DOMRect): TimelineMarker[]`

Returns markers within the specified rectangular area, useful for selection operations.

```typescript
// Get markers in a specific area
const rect = new DOMRect(100, 0, 50, canvas.height);
const markersInArea = markers.getMarkersAt(rect);
console.log('Found markers:', markersInArea);
```

**Parameters:**
- `rect`: Rectangle area to search for markers

**Returns:** Array of markers within the specified area

### `getMarkersAtPoint(x: number, y: number): TimelineMarker[]`

Returns markers at a specific point, with a small hitbox padding.

```typescript
// Get markers at specific coordinates
const markersAtPoint = markers.getMarkersAtPoint(150, 200);
console.log('Markers at point:', markersAtPoint);
```

**Parameters:**
- `x`: X coordinate
- `y`: Y coordinate

**Returns:** Array of markers at the specified point

### `isSelectedMarker(time: number): boolean`

Checks if a marker at the given time is currently selected.

```typescript
// Check if marker is selected
const isSelected = markers.isSelectedMarker(Date.now());
console.log('Is marker selected:', isSelected);
```

**Parameters:**
- `time`: Timestamp of the marker to check

**Returns:** `true` if the marker is selected, `false` otherwise

### `isHoveredMarker(time: number): boolean`

Checks if a marker at the given time is currently hovered.

```typescript
// Check if marker is hovered
const isHovered = markers.isHoveredMarker(Date.now());
console.log('Is marker hovered:', isHovered);
```

**Parameters:**
- `time`: Timestamp of the marker to check

**Returns:** `true` if the marker is hovered, `false` otherwise

### `render()`

Renders all visible markers within the current viewport. This method is called automatically during timeline rendering.

```typescript
// This is handled internally
markers.render();
```

**Rendering Process:**
1. Applies static transform to the canvas context
2. Resets label positions for new render pass
3. Renders visible markers using spatial indexing for performance
4. Handles marker grouping/collapsing for dense areas
5. Manages label collision avoidance

## Marker Structure

Each marker in the timeline has the following structure:

```typescript
type TimelineMarker = {
  time: number;                    // Timestamp for the marker position
  color: string;                   // Color of the marker line
  activeColor: string;             // Color when marker is selected (required)
  hoverColor: string;              // Color when marker is hovered (required)
  lineWidth?: number;              // Optional width of the marker line
  label?: string;                  // Optional label text
  labelColor?: string;             // Optional label color
  renderer?: AbstractMarkerRenderer; // Optional custom renderer
  nonSelectable?: boolean;         // Whether marker can be selected
  group?: boolean;                 // Whether marker represents a group
};
```

## Marker Grouping and Zoom

The Markers component automatically groups markers that are close together based on the `collapseMinDistance` configuration. When markers are grouped, they appear as a single marker with a count label.

### Group Zoom Functionality

When you click on a grouped marker (showing a number), the timeline automatically zooms to show all individual markers in that group. This feature can be configured through the markers configuration.

#### Configuration Options

```typescript
type MarkerViewOptions = {
  // ... other options ...
  collapseEnabled?: boolean;        // Enable/disable marker grouping
  collapseMinDistance?: number;     // Distance in pixels for grouping
  groupZoomEnabled?: boolean;       // Enable/disable group zoom
  groupZoomPadding?: number;        // Padding ratio around group (0.2 = 20%)
  groupZoomMaxFactor?: number;      // Maximum zoom factor (0.5 = 50% of current view)
};
```

#### Default Values

```typescript
{
  collapseEnabled: true,
  collapseMinDistance: 4,
  groupZoomEnabled: true,
  groupZoomPadding: 0.2,
  groupZoomMaxFactor: 0.5,
}
```

#### Group Zoom Events

When a grouped marker is clicked, the following event is emitted:

```typescript
timeline.on('on-group-marker-click', (event) => {
  const { groupMarker, originalMarkers, newInterval } = event.detail;
  
  console.log('Group clicked:', {
    groupMarker,           // The grouped marker that was clicked
    originalMarkers,       // Array of all markers in the group
    newInterval: {         // New timeline interval
      start: number,
      end: number
    }
  });
});
```

#### Example: Custom Group Zoom Behavior

```typescript
// Listen for group marker clicks
timeline.on('on-group-marker-click', (event) => {
  const { originalMarkers, newInterval } = event.detail;
  
  // Custom zoom behavior
  if (originalMarkers.length > 5) {
    // For large groups, add extra padding
    const padding = (newInterval.end - newInterval.start) * 0.5;
    timeline.api.setRange(
      newInterval.start - padding,
      newInterval.end + padding
    );
  }
});
```

#### Disabling Group Zoom

To disable the group zoom functionality:

```typescript
const timeline = new Timeline({
  settings: { /* ... */ },
  viewConfiguration: {
    markers: {
      groupZoomEnabled: false
    }
  }
});
```

#### Disabling Marker Grouping

To disable marker grouping entirely:

```typescript
const timeline = new Timeline({
  settings: { /* ... */ },
  viewConfiguration: {
    markers: {
      collapseEnabled: false
    }
  }
});
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
        activeColor: '#ff5252',
        hoverColor: '#ff1744',
        label: 'Start'
      }
    ]
  },
  viewConfiguration: {
    markers: {
      font: '12px Arial',
      groupColor: '#fe7f2d',
      groupColorHover: '#ff0000',
      hitboxPadding: 2,
      collapseMinDistance: 4,
      collapseEnabled: true,
      groupZoomEnabled: true,
      groupZoomPadding: 0.2,
      groupZoomMaxFactor: 0.5
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
        activeColor: '#ff5252',
        hoverColor: '#ff1744',
        label: 'Custom Marker',
        lineWidth: 2,
        labelColor: '#000000'
      }
    ]
  },
  viewConfiguration: {
    markers: {
      // Customize marker appearance  
      font: '14px Arial',
      groupColor: '#fe7f2d',
      groupColorHover: '#ff0000',
      hitboxPadding: 4,
      collapseMinDistance: 8,
      collapseEnabled: true,
      groupZoomEnabled: true,
      groupZoomPadding: 0.3,
      groupZoomMaxFactor: 0.4
    }
  }
});
```

## Implementation Details

### Label Collision Avoidance and Render Priority

The Markers component implements a right-to-left rendering strategy for labels to prevent overlapping. Additionally, selected and hovered markers have render priority, meaning their labels will always be displayed even if they would overlap with other labels:

- **Standard Labels**: Rendered right-to-left with collision avoidance
- **Priority Labels**: Selected and hovered markers bypass collision detection
- **Render Order**: Priority labels are positioned optimally without considering other labels

```typescript
// Label rendering is handled by the DefaultMarkerRenderer
// which implements the AbstractMarkerRenderer interface
class DefaultMarkerRenderer extends AbstractMarkerRenderer {
  render(data: {
    ctx: CanvasRenderingContext2D;
    marker: TimelineMarker;
    isSelected: boolean;
    isHovered: boolean;
    markerPosition: number;
    viewConfiguration: ViewConfiguration;
    lastRenderedLabelPosition: { top: number; bottom: number };
    timeToPosition: (n: number) => number;
    getLabelSize: (label: string) => LabelSize;
  }): void {
    // Render marker line and labels
    // Selected and hovered markers get render priority
    // Standard markers follow collision avoidance rules
    const isActive = isSelected || isHovered;
    if (isActive || canRenderWithoutCollision()) {
      renderLabel();
    }
  }
}
```

### Marker State Priority

The render priority system ensures that important markers are always visible:

```typescript
// Priority rendering logic
const isActive = isSelected || isHovered;

if (isActive) {
  // Active markers always render their labels
  // Position is calculated to fit optimally within canvas bounds
  const labelPosition = this.calculateSelectedLabelPosition(
    markerPosition,
    widthWithPadding, 
    ctx.canvas.width
  );
  this.drawLabelContent(ctx, color, marker, labelPosition, ...);
} else if (canRenderWithoutCollision()) {
  // Standard markers only render if they don't overlap
  this.drawLabelContent(ctx, color, marker, labelPosition, ...);
}
```

**Priority Benefits:**
- Selected markers are always clearly visible
- Hovered markers provide immediate visual feedback
- Important context is never hidden by collision avoidance
- Maintains clean visual hierarchy

### Text Width Caching

The component caches text widths for better performance:

```typescript
// Text dimension caching is handled internally
private getLabelSize(text: string): LabelSize {
  if (this.textWidthCache.has(text)) {
    return this.textWidthCache.get(text);
  }

  const { markers } = this.api.getViewConfiguration();
  this.api.ctx.save();
  this.api.ctx.font = markers.font;
  
  const metrics = this.api.ctx.measureText(text);
  const size: LabelSize = {
    width: metrics.width,
    height: parseInt(markers.font) || 12 // Extract font size
  };
  
  this.textWidthCache.set(text, size);
  this.api.ctx.restore();
  return size;
}
```

### Marker Rendering

Markers are rendered with support for both top and bottom labels:

```typescript
// Marker rendering is delegated to the renderer
protected renderMarker(marker: TMarker) {
  const markerPosition = this.api.timeToPosition(marker.time);
  const isSelected = this.isSelectedMarker(marker.time);
  const isHovered = this.isHoveredMarker(marker.time);
  
  const renderer = marker.renderer || new DefaultMarkerRenderer();
  
  renderer.render({
    ctx: this.api.ctx,
    marker,
    isSelected,
    isHovered,
    markerPosition,
    viewConfiguration: this.api.getViewConfiguration(),
    lastRenderedLabelPosition: this.lastRenderedLabelPosition,
    timeToPosition: (time) => this.api.timeToPosition(time),
    getLabelSize: (label) => this.getLabelSize(label)
  });
}
```

## Performance Optimizations

### Spatial Indexing

The Markers component uses RBush spatial indexing for efficient marker queries:

```typescript
// Spatial index automatically handles large numbers of markers
const index = new RBush<BBox & { marker: TMarker }>(MAX_INDEX_TREE_WIDTH);

// Efficient rectangular queries
const markersInArea = markers.getMarkersAt(boundingRect);
```

This enables high-performance rendering and interaction even with thousands of markers.

### Viewport Culling

Only markers visible within the current viewport (plus overscan) are rendered:

```typescript
// Only render markers that intersect with the visible timerange
const visibleMarkers = sortedMarkers.filter(marker => 
  intersects(marker.time, viewStart, viewEnd)
);
```

### Text Dimension Caching

Label dimensions are cached to avoid repeated canvas measurements:

```typescript
// Cache avoids expensive measureText() calls
const cachedSize = this.textWidthCache.get(labelText);
```

## Click Filtering

The Markers component supports custom filtering of markers during click interactions through the `clickMarkerCollectionFilter` setting. This allows you to control which markers can be selected when users click on the timeline.

```typescript
const timeline = new Timeline({
  settings: {
    // ... other settings
    clickMarkerCollectionFilter: (candidates: TimelineMarker[]) => {
      // Custom filtering logic
      return candidates.filter(marker => {
        // Example: Only allow selection of non-selectable markers
        return !marker.nonSelectable;
      });
    }
  }
});
```

**Filter Function Details:**
- **Input**: Array of markers at the click position (`candidates`)
- **Output**: Filtered array of markers that should be selectable
- **When called**: Before marker selection and `on-marker-select-change` event emission
- **Use cases**: Implement permissions, business rules, or custom selection logic

**Example Use Cases:**

```typescript
// Only select the first marker (avoid multi-selection)
clickMarkerCollectionFilter: (candidates) => 
  candidates.length > 0 ? [candidates[0]] : [];

// Filter based on marker groups
clickMarkerCollectionFilter: (candidates) => 
  candidates.filter(marker => !marker.group);

// Filter based on custom properties
clickMarkerCollectionFilter: (candidates) => 
  candidates.filter(marker => marker.userCanInteract);

// Select markers with specific labels only
clickMarkerCollectionFilter: (candidates) => 
  candidates.filter(marker => marker.label && marker.label.includes('Important'));
```

## Event Integration

### Marker Selection

Markers integrate with the timeline's selection system:

```typescript
// Listen for marker selection changes
timeline.on('on-marker-select-change', (event) => {
  const { markers } = event.detail;  // Markers after filtering
  console.log('Selected markers:', markers);
});
```

### Marker Hover

Hover states are automatically managed:

```typescript
// Hover events are handled internally
// Markers will use hoverColor when mouse is over them
```

## Best Practices

1. **Marker Configuration**
   - Always provide `activeColor` and `hoverColor` (required fields)
   - Use meaningful labels for accessibility
   - Choose appropriate colors for visibility
   - Consider `lineWidth` based on marker importance

2. **Label Management**
   - Keep labels concise to prevent overcrowding
   - Use consistent styling across related markers
   - Consider the grouping threshold when placing dense markers

3. **Performance**
   - Leverage spatial indexing for marker queries
   - Use marker grouping for dense datasets
   - Consider the viewport when adding/removing markers
   - Cache expensive operations when implementing custom renderers

4. **Custom Renderers**
   - Extend `AbstractMarkerRenderer` for custom visualization
   - Use provided utilities like `getLabelSize()` and `timeToPosition()`
   - Respect the collision avoidance system
   - Handle selection and hover states appropriately 