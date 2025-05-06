# YaTimeline Library

A web component library for building interactive timeline visualizations using Lit.

## Features

- Canvas-based rendering for high performance
- Interactive timeline with zoom and pan capabilities
- Support for events, markers, axes, and grid
- Customizable appearance

## Installation

```bash
npm install timeline
```

## Usage

```typescript
import { YaTimeline, Ruler, Grid, Axes, Events } from 'timeline';

// Create a custom timeline component
class MyTimeline extends YaTimeline {
  protected createComponents() {
    return [
      new Ruler(this),
      new Grid(this),
      new Axes(this),
      new Events(this),
    ];
  }
}

// Register the custom element
customElements.define('my-timeline', MyTimeline);
```

Then use it in your HTML:

```html
<my-timeline></my-timeline>
```

## Development

### Scripts

- `npm run build` - Build the library
- `npm run lint` - Run ESLint
- `npm run lint:all` - Run ESLint on all files

### Storybook

This project includes Storybook for component development and documentation.

To run Storybook:

```bash
npm run storybook
```

This will start the Storybook development server on port 6006. You can access it at http://localhost:6006.

To build a static version of Storybook for deployment:

```bash
npm run build-storybook
```

For more information on using Storybook, see the [Storybook README](.storybook/README.md).

## License

MIT
