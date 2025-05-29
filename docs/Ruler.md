# Ruler API Reference

The `Ruler` component is responsible for rendering the time scale and labels on the timeline. It handles the visualization of time intervals, grid lines, and their labels with automatic level selection based on zoom level using `RulerLevel` and `RulerSupLevel`.

## Overview

```typescript
import { Ruler } from '@gravity-ui/timeline';

// Ruler is created internally by the Timeline class
// It's not meant to be instantiated directly
const ruler = new Ruler(timeline.api);
```

## Properties

| Property | Type | Description | Visibility |
|----------|------|-------------|------------|
| `api` | `CanvasApi` | API instance for timeline manipulation | private |
| `levelCache` | `Map<RulerLevel, number>` | Cache for level mark widths | private |
| `labelLevels` | `RulerLevel[]` | Array of available time marking levels | private |

## Methods

### `constructor(api: CanvasApi)`

Creates a new Ruler instance. This constructor is called internally by the Timeline class.

```typescript
// This is handled internally by the Timeline class
const ruler = new Ruler(timeline.api);
```

**Parameters:**
- `api`: CanvasApi instance for timeline manipulation

### `render()`

Renders the ruler component including background, labels, and grid lines. This method is called automatically during timeline rendering.

```typescript
// This is handled internally
ruler.render();
```

**Rendering Process:**
1. Applies static transform to the canvas context
2. Draws the ruler background
3. Sets up text properties (font, line join, etc.)
4. Renders the bottom border line
5. Renders time marking levels with labels

## Ruler Levels

The Ruler component uses a system of levels to display time markings at different granularities. Each level has the following structure:

```typescript
type RulerLevel = {
  domain: number;           // Maximum time domain for this level
  format: string;          // Date format string for labels
  step: (t: dayjs.Dayjs) => dayjs.Dayjs;  // Function to step to next time point
  start: (t: number) => dayjs.Dayjs;      // Function to get start time
  color?: (t: number) => string;          // Optional function for dynamic label color
  sup?: RulerSupLevel;     // Optional secondary level
};
```

## Examples

### Basic Usage

The Ruler component is used internally by the Timeline class. Here's how it's typically configured:

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
    ruler: {
      height: 32,
      font: '12px Arial',
      spacing: 100,
      position: 24,
      subPosition: 12,
      color: {
        background: '#ffffff',
        borderColor: '#e0e0e0',
        primaryLevel: '#000000',
        secondaryLevel: '#666666',
        textOutlineColor: '#ffffff'
      }
    }
  }
});

// Initialize with canvas
const canvas = document.querySelector('canvas');
if (canvas instanceof HTMLCanvasElement) {
  timeline.init(canvas);
  // Ruler is created and rendered automatically
}
```

### Custom Ruler Configuration

You can customize the appearance of the ruler through the view configuration:

```typescript
const timeline = new Timeline({
  settings: {
    start: Date.now(),
    end: Date.now() + 3600000,
    axes: [],
    events: []
  },
  viewConfiguration: {
    ruler: {
      // Customize ruler appearance
      height: 48,
      font: '14px Arial',
      spacing: 150,
      position: 32,
      subPosition: 16,
      color: {
        background: '#f5f5f5',
        borderColor: '#d0d0d0',
        primaryLevel: '#333333',
        secondaryLevel: '#666666',
        textOutlineColor: '#ffffff'
      }
    }
  }
});
```

## Implementation Details

### Level Selection

The Ruler component automatically selects appropriate time marking levels based on the current zoom level:

```typescript
private findAppropriateLevels(domain: number, width: number) {
  let level: RulerLevel | undefined;
  let supLevel: RulerSupLevel | undefined;

  for (const currentLevel of this.labelLevels) {
    if (domain > currentLevel.domain) continue;

    // Calculate or get cached marks width
    let marksWidth = this.levelCache.get(currentLevel);
    if (marksWidth === undefined) {
      marksWidth = this.calculateMarksWidth(currentLevel, domain, width);
      this.levelCache.set(currentLevel, marksWidth);
    }

    if (marksWidth > width) continue;

    level = currentLevel;
    supLevel = level.sup || this.labelLevels[this.labelLevels.indexOf(currentLevel) + 1];
    break;
  }

  return { level, supLevel };
}
```

### Label Rendering

Labels are rendered with support for both primary and secondary levels:

```typescript
private renderLevel(
  level: RulerLevel | RulerSupLevel,
  y: number,
  color: string,
) {
  const { ruler } = this.api.getVisualConfiguration();
  const { start, end } = this.api.getInterval();
  const { ctx, width } = this.api;

  ctx.strokeStyle = ruler.color.textOutlineColor;
  const t0 = level.start(start);
  let firstRendered = null;

  // Render fully visible labels
  for (let t = t0; Number(t) < end; t = level.step(t)) {
    const label = dayjs(t).format(level.format);
    const x = this.timeToPosition(t);

    if (x > 10 && x < width) {
      if (!firstRendered) firstRendered = t;
      ctx.fillStyle = (level.color && level.color(t)) || color;
      ctx.strokeText(label, x, y);
      ctx.fillText(label, x, y);
    }
  }

  // Render edge label if partially visible
  this.renderEdgeLabel(level, y, color, firstRendered);
}
```

## Best Practices

1. **Level Configuration**
   - Choose appropriate time formats for each level
   - Consider the density of labels at different zoom levels
   - Use secondary levels for additional time granularity

2. **Visual Design**
   - Ensure sufficient contrast between labels and background
   - Use consistent font sizes and colors
   - Consider using text outlines for better readability

3. **Performance**
   - Utilize the level cache for mark width calculations
   - Minimize the number of label levels
   - Consider the impact of custom color functions 