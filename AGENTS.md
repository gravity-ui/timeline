# AGENTS.md

## Project overview

`@gravity-ui/timeline` is a TypeScript library for rendering interactive timelines on HTML Canvas. It provides:

- a framework-agnostic core API;
- React bindings;
- optional Gravity UI integrations;
- Storybook examples and documentation.

The project uses Node.js 20 and npm.

## Repository structure

- `src/` — library source code.
- `src/components/` — canvas-rendered timeline components.
- `src/react-components/` — React bindings exported from `@gravity-ui/timeline/react`.
- `src/react-uikit/` — Gravity UI integrations exported from `@gravity-ui/timeline/react/uikit`.
- `src/types/` — public TypeScript types.
- `src/stories/` — Storybook stories and interactive examples.
- `tests/` — Vitest unit and component tests.
- `tests/e2e/` — Playwright browser tests.
- `docs/` — detailed API documentation.
- `build/` and `storybook-static/` — generated output; do not edit manually.

## Development commands

Install dependencies:

```sh
npm ci
```

Run the standard checks:

```sh
npm run lint:all
npm run typecheck
npm test
```

Run a specific Vitest file:

```sh
npm test -- tests/Timeline.test.ts
```

Run browser tests:

```sh
npm run test:e2e
```

Run Storybook locally:

```sh
npm run storybook
```

Build the package:

```sh
npm run build
```

## Change guidelines

- Make source changes in `src/`, never directly in `build/`.
- Preserve the existing TypeScript and ESLint conventions.
- Use double quotes and the formatting enforced by the repository ESLint configuration.
- Keep changes narrowly scoped; avoid unrelated refactoring.
- Add or update tests for observable behavior changes and bug fixes.
- Prefer deterministic tests. Avoid real timers, network access, and unnecessary browser tests.
- Use Vitest for logic and component behavior. Use Playwright only for behavior that requires an actual browser, canvas interaction, or layout.
- Add or update a Storybook story when introducing visual behavior or a user-facing configuration option.

## Architecture notes

- `Timeline` owns configuration, lifecycle, components, and the public `CanvasApi`.
- `TimelineController` handles browser input and interaction behavior.
- Rendering components operate directly on the canvas and should not depend on React.
- React wrappers should remain thin and delegate timeline behavior to the core classes.
- Renderer base classes are public extension points; preserve backward compatibility when changing them.
- Clean up event listeners and other resources in lifecycle teardown paths.
- Be careful with canvas coordinates, device pixel ratios, scrolling, zooming, and hit testing.

## Public API and compatibility

The package has three public entry points:

- `src/index.ts` — `@gravity-ui/timeline`.
- `src/react-components/index.ts` — `@gravity-ui/timeline/react`.
- `src/react-uikit/index.ts` — `@gravity-ui/timeline/react/uikit`.

When adding a public API:

- export it from the appropriate entry point;
- define precise TypeScript types;
- update relevant documentation and examples;
- add tests covering its intended behavior;
- avoid breaking existing consumers unless explicitly requested.

Treat exported classes, types, configuration fields, event names, and default values as public API. Prefer additive changes and optional configuration fields.

## Documentation

Update documentation when public behavior changes:

- `README.md` and, where applicable, `README-ru.md`;
- the relevant file under `docs/`;
- Storybook stories for interactive or visual features.

Keep examples consistent with the actual package exports.

## Before finishing

Run the checks relevant to the change. For most source changes, this means:

```sh
npm run lint:all
npm run typecheck
npm test
```

Also run `npm run test:e2e` when changing popup behavior, browser interactions, canvas input handling, or Storybook scenarios used by Playwright.

Report which checks were run and mention any checks that could not be run.
