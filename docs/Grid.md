# Grid API Reference

The `Grid` component is responsible for rendering vertical grid lines on the timeline. It automatically selects and renders appropriate grid levels based on the current zoom level and canvas width.

## Overview

```typescript
import { Grid } from '@gravity-ui/timeline';

// Grid is created internally by the Timeline class
// It's not meant to be instantiated directly
const grid = new Grid(timeline.api);
```

## Properties

| Property | Type | Description | Visibility |
|----------|------|-------------|------------|
| `api` | `CanvasApi` | API instance for timeline manipulation | private |
| `levels` | `TGridLevel[]` | Available grid levels for different zoom ranges | private |

## Methods

### `constructor(api: CanvasApi)`

Creates a new Grid instance. This constructor is called internally by the Timeline class.

```typescript
// This is handled internally by the Timeline class
const grid = new Grid(timeline.api);
```

**Parameters:**
- `api`: CanvasApi instance for timeline manipulation

### `render()`

Renders the grid on the canvas. This method is called automatically during timeline rendering.

```typescript
// This is handled internally
grid.render();
```

**Rendering Process:**
1. Applies static transform to the canvas context
2. Gets current timeline range and configuration
3. Selects appropriate grid level based on zoom
4. Renders vertical grid lines for the selected level

## Grid Levels

The Grid component supports multiple levels of detail, automatically selecting the most appropriate one based on the current zoom level. Each level has the following properties:

```typescript
type TGridLevel = {
  domain: number;           // Maximum domain size for this level
  start: (t: number) => Dayjs;  // Function to get start time
  step: (t: Dayjs) => Dayjs;    // Function to get next time step
  style: (t: Dayjs) => string;  // Function to get line style
};
```

### Default Grid Levels

The grid automatically switches between levels based on the visible time range:

1. **Minutes Level**
   - Domain: 1 hour
   - Step: 5 minutes
   - Style: Light gray lines

2. **Hours Level**
   - Domain: 1 day
   - Step: 1 hour
   - Style: Medium gray lines

3. **Days Level**
   - Domain: 1 week
   - Step: 1 day
   - Style: Dark gray lines

4. **Weeks Level**
   - Domain: 1 month
   - Step: 1 week
   - Style: Darker gray lines

## Examples

### Basic Usage

The Grid component is used internally by the Timeline class. Here's how it's typically used:

```typescript
import { Timeline } from '@gravity-ui/timeline';

// Create timeline instance
const timeline = new Timeline({
  settings: {
    start: Date.now(),
    end: Date.now() + 3600000,
    axes: [],
    events: []
  },
  viewConfiguration: {
    grid: {
      lineWidth: 1,
      spacing: 100,
      widthBuffer: 50
    }
  }
});

// Initialize with canvas
const canvas = document.querySelector('canvas');
if (canvas instanceof HTMLCanvasElement) {
  timeline.init(canvas);
  // Grid is created and rendered automatically
}
```

### Custom Grid Configuration

You can customize the grid appearance through the view configuration:

```typescript
const timeline = new Timeline({
  settings: {
    start: Date.now(),
    end: Date.now() + 3600000,
    axes: [],
    events: []
  },
  viewConfiguration: {
    grid: {
      // Customize grid appearance
      lineWidth: 2,
      spacing: 150,
      widthBuffer: 100,
      // Custom grid levels
      levels: [
        {
          domain: 3600000, // 1 hour
          start: (t) => dayjs(t).startOf('hour'),
          step: (t) => t.add(5, 'minute'),
          style: (t) => '#e0e0e0'
        },
        {
          domain: 86400000, // 1 day
          start: (t) => dayjs(t).startOf('day'),
          step: (t) => t.add(1, 'hour'),
          style: (t) => '#b0b0b0'
        }
      ]
    }
  }
});
```

## Implementation Details

### Grid Level Selection

The grid automatically selects the most appropriate level based on the current zoom level:

```typescript
private selectGridLevel(domainSize: number, canvasWidth: number): TGridLevel | null {
  if (!this.levels.length) return null;

  for (const level of this.levels) {
    if (domainSize > level.domain) continue;

    // Check if marks fit within visible area
    if (this.calculateMarksWidth(level, domainSize) > 
        canvasWidth + this.api.getVisualConfiguration().grid.widthBuffer) {
      continue;
    }

    return level;
  }

  // Return coarsest level as fallback
  return this.levels[this.levels.length - 1];
}
```

### Grid Line Rendering

Grid lines are rendered using the canvas 2D context:

```typescript
private renderLevel(top: number, left: number, width: number, height: number, level: TGridLevel) {
  const { grid } = this.api.getVisualConfiguration();
  const { start, end } = this.api.getInterval();
  const { ctx } = this.api;
  
  ctx.lineWidth = grid.lineWidth;

  // Draw vertical lines for each time point
  for (let t = level.start(start); Number(t) < end; t = level.step(t)) {
    const x = Math.floor(convertDomain(Number(t), start, end, left, left + width));
    ctx.beginPath();
    ctx.strokeStyle = level.style(t);
    ctx.moveTo(x, top);
    ctx.lineTo(x, top + height);
    ctx.stroke();
  }
}
```

### Performance Considerations

The Grid component is optimized for performance:

1. **Level Selection**: Only renders the most appropriate level for the current zoom
2. **Buffer Space**: Uses widthBuffer to prevent unnecessary rendering of off-screen lines
3. **Static Transform**: Uses static transform for better performance
4. **Efficient Calculations**: Caches calculations where possible

## Best Practices

1. **Grid Configuration**
   - Adjust `spacing` based on your timeline's typical zoom levels
   - Set appropriate `widthBuffer` to balance performance and visual quality
   - Customize `lineWidth` based on your design requirements

2. **Custom Levels**
   - Define levels with appropriate domain sizes
   - Ensure step functions are efficient
   - Use consistent styling within each level

3. **Performance**
   - Avoid too many grid levels
   - Keep step functions simple
   - Use appropriate buffer sizes 