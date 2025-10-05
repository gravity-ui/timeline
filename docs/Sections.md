# Sections API Reference

The `Sections` component is responsible for rendering background sections on the timeline. It provides colored background areas that help visually organize timeline content and highlight time periods.

## Overview

```typescript
import { Sections } from '@gravity-ui/timeline';

// Sections is created internally by the Timeline class
// It's not meant to be instantiated directly
const sections = new Sections(timeline.api);
```

## Properties

| Property | Type | Description | Visibility |
|----------|------|-------------|------------|
| `api` | `CanvasApi` | API instance for timeline manipulation | protected |
| `_sections` | `TSection[]` | Array of all sections | protected |
| `index` | `RBush` | Spatial index for efficient section lookup | protected |
| `hoveredSections` | `string[] \| undefined` | Array of currently hovered section IDs | private |

## Methods

### `constructor(api: CanvasApi)`

Creates a new Sections instance. This constructor is called internally by the Timeline class.

```typescript
// This is handled internally by the Timeline class
const sections = new Sections(timeline.api);
```

**Parameters:**
- `api`: CanvasApi instance for timeline manipulation

### `setSections(sections: TSection[])`

Updates the sections data and rebuilds the spatial index.

```typescript
// Update sections with new data
sections.setSections([
  {
    id: 'section1',
    from: Date.now(),
    to: Date.now() + 3600000,
    color: 'rgba(255, 0, 0, 0.2)',
    hoverColor: 'rgba(255, 0, 0, 0.3)'
  },
  {
    id: 'section2', 
    from: Date.now() + 1800000,
    // to is optional - extends to end of timeline
    color: 'rgba(0, 255, 0, 0.1)'
  }
]);
```

**Parameters:**
- `sections`: Array of sections to display on the timeline

### `getSectionsAt(rect: DOMRect): TimelineSection[]`

Finds sections that intersect with the given rectangle.

```typescript
// Find sections in a specific area
const sectionsInArea = sections.getSectionsAt(new DOMRect(100, 0, 200, canvas.height));
```

**Parameters:**
- `rect`: DOMRect representing the search area

**Returns:**
- Array of sections that intersect with the rectangle

### `getSectionsAtPoint(x: number, y: number): TimelineSection[]`

Finds sections at a specific point on the canvas.

```typescript
// Find sections at a specific point
const sectionsAtPoint = sections.getSectionsAtPoint(150, 150);
```

**Parameters:**
- `x`: X coordinate
- `y`: Y coordinate

**Returns:**
- Array of sections at the specified point

### `isHoveredSection(id: string): boolean`

Checks if a section with the given ID is currently being hovered.

```typescript
// Check if section is hovered
const isHovered = sections.isHoveredSection('section1');
console.log('Is section hovered:', isHovered);
```

**Parameters:**
- `id`: Section ID to check

**Returns:**
- `true` if the section is hovered, `false` otherwise

### `render()`

Renders all visible sections within the current viewport. This method is called automatically during timeline rendering.

```typescript
// This is handled internally
sections.render();
```

**Rendering Process:**
1. Applies scroll transform to the canvas context
2. Iterates through all sections
3. Checks if sections intersect with the current viewport
4. Renders sections using their assigned renderer
5. Handles hover state for interactive feedback

## Section Structure

Each section in the timeline has the following structure:

```typescript
type TimelineSection = {
  id: string;                          // Unique section identifier
  from: number;                        // Start timestamp
  to?: number;                         // Optional end timestamp (defaults to timeline end)
  color: string;                       // Section background color
  hoverColor?: string;                 // Optional color when section is hovered
  renderer?: AbstractSectionRenderer;  // Optional custom renderer
};
```

## Section Renderers

The Sections component supports custom section renderers through the `AbstractSectionRenderer` class:

```typescript
abstract class AbstractSectionRenderer<TSection extends TimelineSection = TimelineSection> {
  public abstract render(data: {
    ctx: CanvasRenderingContext2D;
    section: TSection;
    x0: number;
    x1: number;
    y0: number;
    h: number;
    isHovered: boolean;
    viewConfiguration: ViewConfiguration;
    timeToPosition?: (n: number) => number;
  }): void;

  public abstract getHitbox(
    section: TSection,
    x0: number,
    x1: number,
  ): Hitbox;
}
```

### Default Section Renderer

The `DefaultSectionRenderer` provides basic rectangular section rendering:

```typescript
class DefaultSectionRenderer<TSection extends TimelineSection> 
  extends AbstractSectionRenderer<TSection> {
  
  public render({ ctx, section, x0, x1, y0, h, isHovered }: {
    ctx: CanvasRenderingContext2D;
    section: TSection;
    x0: number;
    x1: number;
    y0: number;
    h: number;
    isHovered: boolean;
    viewConfiguration: ViewConfiguration;
    timeToPosition?: (n: number) => number;
  }) {
    const hoverColor = section.hoverColor || section.color;
    
    ctx.beginPath();
    ctx.fillStyle = isHovered ? hoverColor : section.color;
    ctx.rect(x0, y0 - h / 2, x1 - x0, h);
    ctx.fill();
  }

  public getHitbox(section: TSection, x0: number, x1: number): Hitbox {
    return {
      left: x0,
      right: x1,
      top: 0,
      bottom: 0
    };
  }
}
```

## Configuration

Sections can be configured through the `ViewConfiguration`:

```typescript
type SectionViewOptions = {
  hitboxPadding?: number;  // Padding for hover detection (default: 2)
};

// Configure section options
const timeline = new Timeline({
  settings: { /* ... */ },
  viewConfiguration: {
    sections: {
      hitboxPadding: 4  // Increase hover detection area
    }
  }
});
```

## Examples

### Basic Usage

The Sections component is used internally by the Timeline class:

```typescript
import { Timeline } from '@gravity-ui/timeline';

// Create timeline with sections
const timeline = new Timeline({
  settings: {
    start: Date.now(),
    end: Date.now() + 3600000,
    axes: [{
      id: 'axis1',
      tracksCount: 1,
      top: 0,
      height: 100
    }],
    events: [],
    sections: [
      {
        id: 'morning',
        from: Date.now(),
        to: Date.now() + 1800000,  // 30 minutes
        color: 'rgba(255, 235, 59, 0.3)',  // Light yellow
        hoverColor: 'rgba(255, 235, 59, 0.4)'
      },
      {
        id: 'afternoon',
        from: Date.now() + 1800000,
        to: Date.now() + 3600000,  // Next 30 minutes
        color: 'rgba(76, 175, 80, 0.3)',   // Light green
        hoverColor: 'rgba(76, 175, 80, 0.4)'
      }
    ]
  },
  viewConfiguration: {
    sections: {
      hitboxPadding: 2
    }
  }
});

// Initialize with canvas
const canvas = document.querySelector('canvas');
if (canvas instanceof HTMLCanvasElement) {
  timeline.init(canvas);
  // Sections are created and rendered automatically
}
```

### React Integration

```typescript
import { TimelineCanvas, useTimeline } from '@gravity-ui/timeline/react';

function TimelineWithSections() {
  const { timeline } = useTimeline({
    settings: {
      start: Date.now(),
      end: Date.now() + 7200000,  // 2 hours
      axes: [{
        id: 'main',
        tracksCount: 3,
        top: 0,
        height: 80
      }],
      events: [
        // Your events here
      ],
      sections: [
        {
          id: 'phase1',
          from: Date.now(),
          to: Date.now() + 2400000,  // 40 minutes
          color: 'rgba(33, 150, 243, 0.2)',  // Blue
          hoverColor: 'rgba(33, 150, 243, 0.3)'
        },
        {
          id: 'phase2',
          from: Date.now() + 2400000,
          to: Date.now() + 4800000,  // Next 40 minutes
          color: 'rgba(255, 152, 0, 0.2)',   // Orange
          hoverColor: 'rgba(255, 152, 0, 0.3)'
        },
        {
          id: 'phase3',
          from: Date.now() + 4800000,
          // No 'to' - extends to timeline end
          color: 'rgba(76, 175, 80, 0.2)',   // Green
          hoverColor: 'rgba(76, 175, 80, 0.3)'
        }
      ]
    }
  });

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <TimelineCanvas timeline={timeline} />
    </div>
  );
}
```

### Custom Section Renderer

Create a custom renderer for specialized section visualization:

```typescript
import { AbstractSectionRenderer } from '@gravity-ui/timeline';

class GradientSectionRenderer extends AbstractSectionRenderer {
  render({
    ctx,
    section,
    x0,
    x1,
    y0,
    h,
    isHovered
  }: {
    ctx: CanvasRenderingContext2D;
    section: TimelineSection;
    x0: number;
    x1: number;
    y0: number;
    h: number;
    isHovered: boolean;
  }) {
    // Create gradient background
    const gradient = ctx.createLinearGradient(x0, y0 - h/2, x0, y0 + h/2);
    
    if (isHovered) {
      gradient.addColorStop(0, section.hoverColor || section.color);
      gradient.addColorStop(1, 'transparent');
    } else {
      gradient.addColorStop(0, section.color);
      gradient.addColorStop(1, 'transparent');
    }
    
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.rect(x0, y0 - h/2, x1 - x0, h);
    ctx.fill();
    
    // Add border
    ctx.beginPath();
    ctx.strokeStyle = isHovered ? '#666' : '#999';
    ctx.lineWidth = 1;
    ctx.rect(x0, y0 - h/2, x1 - x0, h);
    ctx.stroke();
  }

  getHitbox(section: TimelineSection, x0: number, x1: number): Hitbox {
    return {
      left: x0,
      right: x1,
      top: 0,
      bottom: 0
    };
  }
}

// Use custom renderer
const sectionWithCustomRenderer = {
  id: 'custom-section',
  from: Date.now(),
  to: Date.now() + 3600000,
  color: 'rgba(156, 39, 176, 0.3)',  // Purple
  hoverColor: 'rgba(156, 39, 176, 0.5)',
  renderer: new GradientSectionRenderer()
};
```

### Dynamic Section Management

Update sections based on user interaction or data changes:

```typescript
// Timeline instance
const timeline = new Timeline({ /* config */ });

// Function to update sections based on data
function updateSections(data) {
  const newSections = data.map(item => ({
    id: item.id,
    from: item.startTime,
    to: item.endTime,
    color: item.priority === 'high' 
      ? 'rgba(244, 67, 54, 0.2)'   // Red for high priority
      : 'rgba(158, 158, 158, 0.2)', // Gray for normal
    hoverColor: item.priority === 'high'
      ? 'rgba(244, 67, 54, 0.3)'
      : 'rgba(158, 158, 158, 0.3)'
  }));

  // Update sections through the API
  timeline.api.setSections(newSections);
}

// Update sections when data changes
updateSections(newData);
```

## Event Handling

While sections don't emit specific events, they participate in the general timeline interaction system:

```typescript
// Mouse interactions are handled automatically
// Hover state is tracked internally
// No specific events are emitted for sections currently
```

## Performance Considerations

### Spatial Indexing

Sections use RBush spatial indexing for efficient intersection queries:

```typescript
// Efficient rectangular queries for large numbers of sections
const sectionsInViewport = sections.getSectionsAt(viewportRect);
```

### Viewport Culling

Only sections that intersect with the current viewport are rendered:

```typescript
// Automatic viewport culling during render
const { start, end } = this.api.getInterval();
const visibleSections = sections.filter(section => 
  intersects(section.from, section.to || end, start, end)
);
```

### Hover Detection Optimization

Hover detection uses configurable hitbox padding to balance responsiveness and performance:

```typescript
// Configurable hitbox padding
const { hitboxPadding } = this.api.getViewConfiguration().sections;
```

## Best Practices

1. **Color Selection**
   - Use semi-transparent colors (alpha < 0.5) to avoid hiding timeline content
   - Ensure sufficient contrast between section and content colors
   - Provide meaningful hover colors for better UX

2. **Section Boundaries**
   - Use `to` timestamp for precise section boundaries
   - Omit `to` to extend section to timeline end
   - Avoid overlapping sections for visual clarity

3. **Performance**
   - Limit the number of sections for optimal performance
   - Use spatial indexing for queries instead of manual filtering
   - Consider combining adjacent sections with similar properties

4. **Custom Renderers**
   - Extend `AbstractSectionRenderer` for specialized visualization
   - Implement efficient `getHitbox()` for accurate interaction
   - Handle hover states appropriately for good UX
   - Keep rendering operations lightweight

5. **Integration**
   - Sections render behind events and markers
   - Use sections to provide context, not as primary content
   - Coordinate section colors with overall timeline theme
   - Consider accessibility when choosing colors and patterns

## Implementation Details

### Rendering Order

Sections are rendered first in the timeline rendering pipeline, ensuring they appear behind all other timeline elements:

```typescript
// Rendering order in Timeline
1. Sections (background)
2. Grid 
3. Axes
4. Events
5. Ruler
6. Markers (foreground)
```

### Hover Management

The sections component automatically tracks mouse movement and updates hover state:

```typescript
// Mouse tracking is handled internally
protected handleCanvasMousemove = (event: MouseEvent) => {
  const candidates = this.getSectionsAtPoint(event.offsetX, event.offsetY);
  const newHover = candidates.map((section) => section.id);
  
  if (JSON.stringify(this.hoveredSections) === JSON.stringify(newHover)) return;
  
  this.hoveredSections = newHover;
  this.api.rerender();
};
```

### Integration with Timeline

Sections are automatically initialized and managed by the Timeline class:

```typescript
// Automatic initialization in Timeline.initComponents()
this.api.addComponent(ComponentType.Sections, new Sections(this.api));

// Automatic data synchronization in Timeline.init()
this.api.setSections(this.settings.sections || []);
```
