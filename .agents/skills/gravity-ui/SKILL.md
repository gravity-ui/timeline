---
name: gravity-ui
description: Builds, fixes, styles, and composes UI with the Gravity UI design system — the React ecosystem of @gravity-ui/* packages (uikit, charts, table, navigation, date-components, icons, and more). Routes to the correct package when look-alikes exist, applies theming and required setup, and prevents invented component APIs. Applies when working with @gravity-ui imports, uikit, ThemeProvider, --g- CSS tokens, or any prompt (EN or RU) mentioning gravity-ui, гравити, дизайн-система, компоненты, дашборд, таблица, график, or форма.
---

# Building UI with Gravity UI

Build UI on **real** Gravity UI components, not from memory. Gravity UI is a
multi-package React design system (`@gravity-ui/*`), so the two things that go
wrong are picking the wrong package and using an API from the wrong version.
This skill routes you to the right package, grounds you in the installed
version, and stops you from inventing APIs — match the installed versions and
follow the ecosystem catalog instead of guessing.

## Step 0 — pick the right package first (ecosystem routing)

Before doing anything else, work out which `@gravity-ui/*` library the task
needs. Do not guess from training data — the ecosystem has look-alike packages
(`charts` vs `chartkit`, uikit `Table` vs `@gravity-ui/table`, `date-components`
vs `date-utils`, …) and picking the wrong one is the #1 failure.

Open [`references/package-routing.md`](references/package-routing.md) and read
its top: it is the ecosystem catalog, with the live-vs-offline source order,
the "painful pairs" disambiguation, and a one-line "what it's for / what to use
instead" per package. Use it to choose the package, then come back here for
Step 1.

Only after the package is chosen, run Step 1 to ground in that package's
installed version and API.

## Step 1 — ground in the installed version of the chosen package

1. **Read `package.json`.** Note each installed `@gravity-ui/*` package and its
   version. The installed version is the source of truth, not your memory.
   Resolve ranges from `node_modules` (`<pkg>/package.json` `version` field), not
   the range string in the root `package.json`.

2. **Fetch the docs for the package you are about to use, in this order,
   stopping at the first source that answers your question:**

   (a) **LOCAL** — start with `node_modules/@gravity-ui/<pkg>/dist/docs/INDEX.md` or `node_modules/@gravity-ui/<pkg>/build/docs/INDEX.md`.
      If `INDEX.md` is absent for this package, fall back to the package's root `node_modules/@gravity-ui/<pkg>/README.md`.
      This is the *exact* installed version — always preferred for version-sensitive questions.
   (b) **ONLINE** — per-package llms.txt at the **major line**:
      `https://gravity-ui.com/llms/<pkg>/<major>/llms.txt`
      (e.g. `/llms/uikit/7/llms.txt` for `^7.2.1`). The major-line URL serves the
      latest minor of that major — it tracks the major but not the exact patch.
      Use it when LOCAL has no docs for the package.

3. **Fallback rule — never silently proceed on a failed or empty source:**

   - If LOCAL has no README / `dist/docs` / `build/docs` for the package, or they are empty
     → fetch the ONLINE major-line llms.txt (b).
   - If the ONLINE request fails — network timeout, DNS, connection refused
     (air-gapped / corporate proxy), HTTP 404 (major not hosted), or an empty /
     non-markdown body → fall back to LOCAL README + dist/docs or build/docs (a).
   - **Do NOT use the `/llms/<pkg>/llms.txt` "latest" alias** as a fallback — it
     serves the newest major, which may differ from the installed one and have a
     different API. The major-line URL is the versioned fallback; below it, go
     LOCAL, not "latest".
   - If BOTH are unreachable for a package → STOP and tell the user the
     package's docs are unreachable. Do not guess its API from training data.

## Step 2 — implement on the chosen packages, then typecheck

1. **Implement using only the `@gravity-ui/*` packages chosen in Step 0 and
   confirmed installed in Step 1.** Import from those packages exactly — do
   not substitute look-alike libraries (MUI, Ant, plain `<input>`) and do not
   reach for a `@gravity-ui/*` package that Step 1 did not confirm installed.
   Follow the prop APIs from the docs you just read, not memory; if a prop
   you want is not documented, it does not exist — use the documented one, or
   ask the user.

2. **Apply the cross-cutting rules** in `rules/hallucination-traps.md` while
   writing: typography variants, the flex contract, theming/ladders,
   `Button view`, `Icon data`. Per-component traps live in the package's own
   `dist/docs`.

3. **Typecheck before declaring done.** Run the project's typecheck command
   (typically `tsc --noEmit`; for monorepos, the workspace's typecheck script).
   Fix every error before reporting completion — a type error almost always
   means a wrong/invented prop, a wrong import path, or a version mismatch,
   which is precisely what Steps 0–1 were meant to prevent.

   - If the typecheck surfaces a prop/path that contradicts the docs you read
     in Step 1, trust the **installed version** (the typechecker), not the
     docs snapshot — the docs may be from a different minor. Re-ground: read
     the package's `dist/docs/INDEX.md` in `node_modules` for the exact
     installed types.
   - If the typecheck is unavailable (no TS in the project), say so
     explicitly and ask the user how they want to verify; do not silently
     skip verification.
   - **Escape hatch.** If the user explicitly waived verification ("just
     sketch it", "quick prototype", "no need to check"), you may skip the
     typecheck — but state this plainly in your reply: *"typecheck skipped by
     user request — code is not verified"*. Do not skip silently.

## Hard rules

- **`@gravity-ui/uikit` MUST be installed in every Gravity UI project.** It is
  the base component + design-token library every other `@gravity-ui/*` package
  builds on; without it components render unstyled. If `package.json` lacks it,
  stop and have the user install and configure it first (setup:
  `https://gravity-ui.com/llms/uikit/llms.txt`).
- **Read `package.json` before importing any `@gravity-ui/*` package.** Never
  assume a package is installed; never assume its major version.
- **Do not invent props or components.** Before using a component API you are
  not 100% sure of, check `rules/hallucination-traps.md` (ecosystem patterns)
  and the component's README in `dist/docs`. If still unsure, ask the user
  rather than guessing.
- **Never guess icon names** — they are hallucinated more often than not. To
  match an icon from a screenshot/photo/mock, run `scripts/icon-image-search.sh`
  (reverse image search). With only a description, look the name up on
  `gravity-ui.com/icons` or ask the user — do not invent one. Then pass it as an
  object (`<Icon data={CheckIcon} />`), never a string key. See
  `references/icons.md`.
- **Theming uses semantic `--g-*` tokens.** Never hardcode colors (`#fff`,
  `blue-500`); never hand-write `dark:` overrides. Full token tables live in
  `references/theming.md`; the cross-cutting traps (partial brand overrides,
  scoped vs nested `ThemeProvider`, controls on a brand background) live in
  `rules/hallucination-traps.md`.
- **Required setup is package-specific** (style imports, `ThemeProvider`,
  peer-deps). It lives in each package's root README under "Required setup" —
  read it once per package, do not rely on memory.

## What NOT to do

These are the five most common ways agents break Gravity UI code. They are
already implied by the rules above; this section exists as an explicit
stop-sign. If you are about to do any of these, stop and re-ground.

- **Do not substitute non-Gravity libraries.** No MUI, Ant Design, plain
  `<input>`/`<button>`, or look-alike component libs. Use the `@gravity-ui/*`
  package the task needs.
- **Do not invent component APIs or props.** If a prop is not in the docs you
  read in Step 1, it does not exist — do not write `variant=`, `color=`,
  `name=` (on `Icon`), or a `header-3` variant. Use the documented prop or
  ask the user. See `rules/hallucination-traps.md`.
- **Do not use the `/llms/<pkg>/llms.txt` "latest" alias as a fallback.** It
  serves the newest major, which may differ from the installed one and have a
  different API. The versioned online fallback is the major-line URL
  (`/llms/<pkg>/<major>/llms.txt`); below that, go LOCAL.
- **Do not partial-brand.** Setting only `--g-color-base-brand` leaves
  selection, focus, links and contrast on the default accent — a mismatched
  UI. Override the full brand token set, on each theme you support.
- **Do not override internal markup with `[class*='…']` / ID selectors.**
  That's written against one DOM structure and breaks silently when the
  component changes. Climb the customization ladder
  (global token → component CSS API → narrow flagged hack) before ever
  touching structure.

## Deeper material — read on demand

These files live alongside this SKILL.md and load only when relevant:

- `references/package-routing.md` — offline snapshot of the ecosystem catalog
  (`gravity-ui.com/llms.txt`), refreshed each skill release. Used as the
  offline fallback in Step 0.
- `references/theming.md` — verbatim copy of uikit's `docs/theming.md`:
  `--g-*` token layers, `ThemeProvider`, branding, custom themes, scoped
  themes, `uikit-themer`. The bundled copy may lag — read
  `node_modules/@gravity-ui/uikit/build/docs/guides/theming.md` for the
  version-matched file.
- `references/layout.md` — verbatim copy of uikit's `docs/layout.md`:
  spacing scale (`--g-spacing-*`), `Flex`/`Box`, `Row`/`Col`/`Container`
  grid, breakpoints, `useLayoutContext`.
- `references/icons.md` — finding an icon by image
  (`scripts/icon-image-search.sh`) or on gravity-ui.com/icons; the
  object-vs-string rendering rule.
- `rules/hallucination-traps.md` — Incorrect/Correct pairs for the most
  commonly invented APIs: typography variants (`header-3..6` don't exist, no
  `Heading`), the flex contract (`min-width:0`, who shrinks), theming traps
  (partial brand overrides, scoped vs nested `ThemeProvider`, customization
  ladder), `Button view` not `variant`, `Icon data` not `name`. Per-component
  traps live in each package's `dist/docs`, not here.
