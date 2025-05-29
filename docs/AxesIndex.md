# AxesIndex API Reference

The `AxesIndex` class provides efficient indexing and management of timeline axes. It maintains a sorted collection of axes and provides quick lookup capabilities by axis ID.

## Overview

```typescript
import { AxesIndex } from '@gravity-ui/timeline';

// Create a new index for axes
const axesIndex = new AxesIndex<Axis>([], {
  identityFunction: (axis: Axis) => axis.id
});
```

## Properties

| Property | Type | Description | Visibility |
|----------|------|-------------|------------|
| `sortedAxes` | `Axis[]` | Array of axes sorted by their vertical position | public readonly |
| `axesById` | `Record<string, Axis>` | Map of axes indexed by their ID | public readonly |
| `identityFunction` | `(axis: Axis) => string` | Function to extract unique identifier from axis | private readonly |

## Methods

### `constructor(axes: Axis[], options: AxesIndexOptions)`

Creates a new AxesIndex instance.

```typescript
const axesIndex = new AxesIndex<Axis>([
  {
    id: 'axis1',
    tracksCount: 3,
    top: 0,
    height: 100
  }
], {
  identityFunction: (axis: Axis) => axis.id
});
```

**Parameters:**
- `axes`: Initial array of axes to index
- `options`: Configuration options
  ```typescript
  type AxesIndexOptions = {
    identityFunction: (axis: Axis) => string;  // Function to get unique ID
  };
  ```

### `add(axis: Axis): void`

Adds a new axis to the index.

```typescript
axesIndex.add({
  id: 'newAxis',
  tracksCount: 2,
  top: 120,
  height: 80
});
```

**Parameters:**
- `axis`: Axis to add to the index

**Throws:**
- Error if axis with the same ID already exists

### `remove(id: string): void`

Removes an axis from the index by its ID.

```typescript
axesIndex.remove('axis1');
```

**Parameters:**
- `id`: ID of the axis to remove

**Throws:**
- Error if axis with the given ID doesn't exist

### `get(id: string): Axis`

Gets an axis by its ID.

```typescript
const axis = axesIndex.get('axis1');
```

**Parameters:**
- `id`: ID of the axis to retrieve

**Returns:**
- The axis object if found

**Throws:**
- Error if axis with the given ID doesn't exist

### `update(axis: Axis): void`

Updates an existing axis in the index.

```typescript
axesIndex.update({
  id: 'axis1',
  tracksCount: 4,  // Updated track count
  top: 0,
  height: 120     // Updated height
});
```

**Parameters:**
- `axis`: Updated axis object

**Throws:**
- Error if axis with the given ID doesn't exist

### `clear(): void`

Removes all axes from the index.

```typescript
axesIndex.clear();
```

### `rebuild(axes: Axis[]): void`

Rebuilds the index with a new set of axes.

```typescript
axesIndex.rebuild([
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
- `axes`: New array of axes to index

## Examples

### Basic Usage

```typescript
import { AxesIndex } from '@gravity-ui/timeline';

// Create index
const axesIndex = new AxesIndex<Axis>([], {
  identityFunction: (axis: Axis) => axis.id
});

// Add axes
axesIndex.add({
  id: 'main',
  tracksCount: 3,
  top: 0,
  height: 100
});

axesIndex.add({
  id: 'secondary',
  tracksCount: 2,
  top: 120,
  height: 80
});

// Get axis by ID
const mainAxis = axesIndex.get('main');

// Update axis
axesIndex.update({
  id: 'main',
  tracksCount: 4,  // Changed track count
  top: 0,
  height: 120     // Changed height
});

// Remove axis
axesIndex.remove('secondary');

// Get all axes in sorted order
const allAxes = axesIndex.sortedAxes;
```

### Integration with Axes Component

```typescript
import { Axes, AxesIndex } from '@gravity-ui/timeline';

class AxesComponent {
  private axesIndex: AxesIndex<Axis>;

  constructor(api: CanvasApi) {
    this.axesIndex = new AxesIndex<Axis>([], {
      identityFunction: (axis: Axis) => axis.id
    });
  }

  setAxes(newAxes: Axis[]) {
    // Rebuild index with new axes
    this.axesIndex.rebuild(newAxes);
    
    // Trigger re-render
    this.api.rerender();
  }

  getAxisById(id: string): Axis {
    return this.axesIndex.get(id);
  }

  render() {
    // Render axes in sorted order
    for (const axis of this.axesIndex.sortedAxes) {
      this.renderAxis(axis);
    }
  }
}
```

### Custom Identity Function

```typescript
// Use custom ID generation
const axesIndex = new AxesIndex<Axis>([], {
  identityFunction: (axis: Axis) => `${axis.id}-${axis.tracksCount}`
});

// Add axes with custom IDs
axesIndex.add({
  id: 'main',
  tracksCount: 3,
  top: 0,
  height: 100
}); // ID will be 'main-3'

axesIndex.add({
  id: 'main',
  tracksCount: 4,
  top: 120,
  height: 80
}); // ID will be 'main-4'
```

## Implementation Details

### Sorting

The `AxesIndex` maintains axes in sorted order based on their vertical position (`top` property):

```typescript
private sortAxes() {
  this.sortedAxes.sort((a, b) => a.top - b.top);
}
```

### Indexing

The index uses a Record for O(1) lookups by ID:

```typescript
private buildIndex() {
  this.axesById = {};
  for (const axis of this.sortedAxes) {
    const id = this.identityFunction(axis);
    this.axesById[id] = axis;
  }
}
```

## Best Practices

1. **Identity Function**
   - Ensure the identity function returns unique values
   - Consider using composite keys for complex scenarios
   - Keep the function simple and efficient

2. **Performance**
   - Use `get()` for frequent lookups
   - Batch updates using `rebuild()`
   - Minimize individual `add()`/`remove()` operations

3. **Error Handling**
   - Always check for existing IDs before adding
   - Handle errors for non-existent axes
   - Validate axis data before indexing

4. **Integration**
   - Use with Axes component for timeline rendering
   - Maintain sorted order for visual consistency
   - Consider axis dependencies when updating 