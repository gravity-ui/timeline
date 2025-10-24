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

### Custom Level Labels

You can provide custom label levels to override the default time marking behavior. This allows you to define your own time granularity and formatting logic:

```typescript
import dayjs from 'dayjs';

const timeline = new Timeline({
  settings: {
    start: Date.now(),
    end: Date.now() + 3600000,
    axes: [],
    events: [],
    // Provide custom function to generate ruler levels
    customLevelLabels: (rulerConfig) => {
      return [
        {
          domain: 1000 * 60 * 60 * 24 * 365, // 1 year
          format: 'YYYY',
          step: (t) => t.add(1, 'year'),
          start: (t) => dayjs(t).startOf('year'),
          sup: {
            format: 'MMM',
            step: (t) => t.add(1, 'month'),
            start: (t) => dayjs(t).startOf('month'),
          }
        },
        {
          domain: 1000 * 60 * 60 * 24 * 30, // 1 month
          format: 'MMM DD',
          step: (t) => t.add(1, 'day'),
          start: (t) => dayjs(t).startOf('day'),
        },
        {
          domain: 1000 * 60 * 60, // 1 hour
          format: 'HH:mm',
          step: (t) => t.add(15, 'minute'),
          start: (t) => dayjs(t).startOf('hour'),
        },
      ];
    }
  },
  viewConfiguration: {
    ruler: {
      height: 32,
      font: '12px Arial',
      spacing: 100,
      position: 24,
      subPosition: 12,
    }
  }
});
```

**Custom Level Labels Parameters:**
- `customLevelLabels`: A function that receives the ruler configuration and returns an array of `RulerLevel` objects
- Each `RulerLevel` must have:
  - `domain`: Maximum time domain in milliseconds for this level
  - `format`: Date format string (uses dayjs format)
  - `step`: Function to step to the next time point
  - `start`: Function to get the start time for a given timestamp
  - `color` (optional): Function to dynamically set label color
  - `sup` (optional): Secondary level for additional granularity

### Localized Labels

To display localized date/time labels, import the desired dayjs locale and apply it in the `start` function:

```typescript
import dayjs from 'dayjs';
import 'dayjs/locale/ru';  // Import Russian locale

const timeline = new Timeline({
  settings: {
    start: Date.now(),
    end: Date.now() + 3600000 * 24 * 365,
    axes: [],
    events: [],
    customLevelLabels: () => [
      {
        domain: 1000 * 60 * 60 * 24 * 365, // 1 year
        format: 'MMMM YYYY',              // Will display as "Январь 2024"
        step: (t) => t.add(1, 'month'),
        start: (t) => dayjs(t).locale('ru').startOf('month'),  // Apply locale
        sup: {
          format: 'YYYY',
          step: (t) => t.add(1, 'year'),
          start: (t) => dayjs(t).locale('ru').startOf('year')   // Apply locale
        } 
      },
      {
        domain: 1000 * 60 * 60 * 24 * 30, // 1 month
        format: 'D MMMM',                  // Will display as "15 Января"
        step: (t) => t.add(1, 'day'),
        start: (t) => dayjs(t).locale('ru').startOf('day')
      }
    ]
  }
});
```

**Important:** The locale is preserved throughout the rendering process. The dayjs object returned from `start` maintains its locale when formatting labels.

### Dynamic Locale Switching

For applications that need to change the locale at runtime (e.g., user preference switching), use the global dayjs locale:

```typescript
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import 'dayjs/locale/en';
import 'dayjs/locale/de';

// Create levels WITHOUT .locale() calls
const timeline = new Timeline({
  settings: {
    start: Date.now(),
    end: Date.now() + 3600000 * 24 * 365,
    axes: [],
    events: [],
    customLevelLabels: () => [
      {
        domain: 1000 * 60 * 60 * 24 * 365,
        format: 'MMMM YYYY',
        step: (t) => t.add(1, 'month'),
        start: (t) => dayjs(t).startOf('month'),  // No .locale() call
      }
    ]
  }
});

// Function to switch locale dynamically
function switchLocale(locale: string) {
  dayjs.locale(locale);  // Set global locale
  timeline.render();     // Re-render with new locale
}

// Initial render with English (default)
timeline.init(canvas);

// Switch to Russian
switchLocale('ru');  // All labels will be in Russian

// Switch to German
switchLocale('de');  // All labels will be in German
```

**Approach Comparison:**

| Approach | Use Case | Pros | Cons |
|----------|----------|------|------|
| **Per-level locale** (`start: (t) => dayjs(t).locale('ru')...`) | Fixed locale per timeline instance | Explicit, multiple timelines with different locales | Cannot change dynamically |
| **Global locale** (`dayjs.locale('ru')`) | Dynamic locale switching | Simple, works across all timelines | Global state affects all dayjs usage |

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
    const label = t.format(level.format);  // Preserves locale from level.start()
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