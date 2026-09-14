# Hallucination traps — Incorrect / Correct pairs

Read this before using any Gravity UI component API you are not 100% sure of.
These are the APIs agents invent most often — each pair shows the wrong guess,
the correct form, and *why*. The references under `references/` cover the
ground truth (full token tables, prop lists); this file is the shortcut to not
falling into the common holes.

Per-component traps (a specific `Table`, `Button`, `Chart` prop) live in each
package's own `dist/docs/INDEX.md` — read that for component detail. This file
covers the **cross-cutting** traps that affect every `@gravity-ui/*` package.

---

## Typography

### `header-3`…`header-6` do not exist

❌ **Incorrect** — invented scale:

```tsx
<Text variant="header-3">Section title</Text>
<Text variant="header-4">Subsection</Text>
<Heading size="lg">Page title</Heading>   // also: there is no `Heading` component
```

✓ **Correct** — the real `Text` variants:

```tsx
<Text variant="header-1">Page title</Text>
<Text variant="header-2">Section title</Text>
<Text variant="subheader-1">Subsection</Text>   {/* or subheader-2/3 */}
<Text variant="display-1">Hero</Text>           {/* display-1…4 are larger than headers */}
```

**Why:** only `header-1` and `header-2` exist. Above them sit `display-1…4`,
below them `subheader-1…3`. Body variants are `body-1`/`body-2`/`body-3`
(plus `body-short`), and small text is `caption-1`/`caption-2`. There is no
standalone `Heading` component — headings are `<Text variant="…">`. Setting a
size via inline `fontSize` is also wrong; pick the variant.

### Page title is a `Text`, not an `<h1>`

❌ `<h1>Dashboard</h1>`
✓ `<Text variant="header-1">Dashboard</Text>`

**Why:** the design system's metrics (font-family, weight, line-height, tracking)
come from `--g-text-header-1-*` tokens. A raw `<h1>` bypasses them and renders
with the browser default.

---

## Layout — the flex contract

### `Flex`/`Box` have no `padding` / `margin` props

❌ **Incorrect** — MUI-style props (do not exist):

```tsx
<Flex p={4} mb={3}>…</Flex>
<Box padding="16px" marginTop={2}>…</Box>
```

✓ **Correct** — use `gap` between children, `spacing()` / `sp()` for offsets:

```tsx
import {Flex, sp} from '@gravity-ui/uikit';

<Flex gap={4}>                       {/* 16px between children */}
  <Button />
  <Button />
</Flex>

<div className={sp({p: 4, mb: 3})}>…</div>   {/* padding + margin-bottom */}
```

**Why:** `Flex`/`Box` only expose `gap` (a spacing-scale step `0…10`, halves
allowed: `0.5`, `1.5`…). For everything else use the `spacing()` (or `sp()`)
utility, which returns a className, or the raw `--g-spacing-*` variables in
CSS. Never hard-code pixel values.

### In a row, explicitly assign who flexes and who holds

❌ **Incorrect** — relying on flex defaults:

```tsx
<Flex alignItems="center">
  <Avatar />                {/* gets crushed when text is long */}
  <span>{veryLongName}</span>
  <Button>Edit</Button>     {/* also gets crushed */}
</Flex>
```

✓ **Correct** — fix-elements get `flex-shrink: 0`, the flexible middle gets
`flex: 1; min-width: 0`:

```tsx
<Flex alignItems="center" gap={2}>
  <Avatar style={{flexShrink: 0}} />
  <span style={{flex: 1, minWidth: 0}}>{veryLongName}</span>
  <Button style={{flexShrink: 0}}>Edit</Button>
</Flex>
```

**Why:** flex defaults are `flex-shrink: 1` and `min-width: auto` on every
child — both work against you. Without `flex-shrink: 0`, fix-sized elements
(avatars, icons, badges, the right-aligned action button) get squashed when a
sibling is long. Without `min-width: 0` on the flexible child, the flex
`min-width: auto` prevents it from shrinking and the text overflows the
container / overlaps its siblings — and this is invisible to layout tests
because the element's bounding box stays clean. The fix-elements are what
should hold their size; compression goes into the flexible element (text gets
truncated, breadcrumbs collapse to `…`, a list scrolls).

The same contract applies vertically: panels `flex: 1; min-height: 0`;
terminal zones (header / footer / composer) `flex-shrink: 0`.

### Horizontal scroll lives inside the widget, not the page

❌ **Incorrect** — wrap the whole workspace:

```tsx
<div style={{overflowX: 'auto'}}>      {/* breaks sticky headers, sidebars */}
  <Workspace />
</div>
```

✓ **Correct** — wrap only the wide widget, give the content its honest
`min-width`:

```tsx
<div style={{overflowX: 'auto', maxWidth: '100%'}}>
  <WideTable style={{minWidth: 1200}} />
</div>
```

**Why:** wrapping the whole workspace makes sticky columns/headers and the
sidebar scroll horizontally too. Compression should go into scroll on the
container of the wide thing only.

For a full-height app frame: root `height: 100vh` (+ a sane `min-height`),
panels `flex: 1; min-height: 0; overflow-y: auto` — the panel scrolls, not the
document.

---

## Theming

### Styles + fonts are required; order matters

❌ **Incorrect** — missing imports, or theme before base:

```tsx
import './theme.css';                                  // before styles.css → gets overwritten
import {ThemeProvider} from '@gravity-ui/uikit';
// no styles.css, no fonts.css → components render unstyled
```

✓ **Correct**:

```tsx
import '@gravity-ui/uikit/styles/fonts.css';           // fonts first
import '@gravity-ui/uikit/styles/styles.css';          // then base
import './theme.css';                                  // custom ALWAYS after styles.css
import {ThemeProvider} from '@gravity-ui/uikit';
```

**Why:** without `styles.css` + `fonts.css` imported once at the entry point,
every component renders unstyled. A custom theme file imported *before*
`styles.css` is overwritten by it in the cascade — custom always comes after.

### `theme` takes five values — no `"default"` or `"auto"`

❌ `<ThemeProvider theme="default">`
❌ `<ThemeProvider theme="auto">`
✓ `<ThemeProvider theme="light">` / `"dark"` / `"light-hc"` / `"dark-hc"`
✓ `<ThemeProvider theme="system">` (resolves to light/dark from OS preference)

### Branding means a full token set, on both themes — never 2–4 tokens

❌ **Incorrect** — partial override:

```css
.g-root { --g-color-base-brand: #007AFF; }
```

✓ **Correct** — override the full brand group, per theme:

```css
.g-root_theme_light {
  --g-color-base-brand: #007AFF;
  --g-color-base-brand-hover: #0066D6;
  --g-color-base-selection: rgba(0, 122, 255, 0.05);
  --g-color-base-selection-hover: rgba(0, 122, 255, 0.1);
  --g-color-line-brand: #007AFF;
  --g-color-text-brand: #007AFF;
  --g-color-text-brand-contrast: #FFFFFF;   /* required: text on brand bg */
  --g-color-text-link: #007AFF;
  --g-color-text-link-hover: #0066D6;
}
.g-root_theme_dark {
  /* different values — dark usually needs a brighter brand */
  --g-color-base-brand: #2E8BFF;
  /* … same set, dark-tuned … */
}
```

**Why:** the semantic layer has many tokens pointing at "brand" — selection,
focus, links, the contrast text on a brand background. Override only
`--g-color-base-brand` and you get a UI where the button is branded but
selection, links and focus rings are still the default accent. Provide the full
set, and provide it for *each* theme you support (dark themes usually need a
brighter brand than light). Forgetting `--g-color-text-brand-contrast` makes
text on a brand button unreadable.

Better than hand-writing: generate the full set with the
[Themer](https://gravity-ui.com/themer) web tool or
[`@gravity-ui/uikit-themer`](https://github.com/gravity-ui/uikit-themer) — both
recalculate the dependent palette from a single base color.

### A nested `ThemeProvider` without `scoped` does not scope

❌ **Incorrect** — expects a local dark section:

```tsx
<ThemeProvider theme="dark">   {/* no scoped → writes to document.body globally */}
  <Toolbar />
</ThemeProvider>
```

✓ **Correct**:

```tsx
<ThemeProvider scoped theme="dark">
  <Toolbar />
</ThemeProvider>
```

**Why:** an un-scoped `ThemeProvider` writes the theme class to `document.body`
— globally, last-wins — not into the subtree. The `scoped` prop renders a
dedicated `<div class="g-root g-root_theme_dark">` around the children *and*
updates the theme React context (so `useTheme` inside the section sees the
section's theme). For a CSS-only region without context, apply the class
manually: `<div className={getRootClassName({theme: 'dark'})}>`.

### Controls on a brand/colored background: fixed contrast, both themes

❌ **Incorrect** — default button on a brand-colored hero:

```tsx
<section style={{background: 'var(--g-color-base-brand)'}}>
  <Button>Sign up</Button>   {/* default view follows theme → low contrast on bright bg */}
</section>
```

✓ **Correct** — pick a `view` with its own contrasting surface, or scope a CSS
override fixing contrast for both themes:

```tsx
<section style={{background: 'var(--g-color-base-brand)'}}>
  <Button view="raised">Sign up</Button>   {/* solid contrasting surface */}
</section>
```

**Why:** a brand-colored fill is usually the *same* color in light and dark
(it's a fill, not a themed surface), so the control on top should keep a fixed
contrast in both themes rather than lightening/darkening with the theme. Try a
`view` with its own surface (`raised`, `action`); if none fits, override the
component's CSS API (`--g-button-background-color`, `--g-button-text-color`, …)
scoped to the section, with contrast values for both themes. This is distinct
from `--g-color-text-brand-contrast`, which is about text on a *brand button*
(`view="action"`).

### Customization ladder — descend only when there's no higher handle

When you need to change how a Gravity UI component looks, try in this order:

1. **Global tokens** (`--g-*` semantic tokens / theme) — change the look
   everywhere by changing the token, not components one by one.
2. **Component's own CSS API** (`--g-button-*`, `--g-card-border-radius`,
   `--g-text-input-*`, …) — scoped to the wrapper / class of the spot you're
   changing. Check the component's README for the variables it exposes.
3. **A narrow, flagged hack** — a custom class on a specific internal element,
   with a comment "hack on internal classes, pinned to version <X>", and a note
   to upstream it. Only after confirming step 1 and 2 don't expose a handle.
4. **NEVER** broad structural matches: `[class*='…']` or ID selectors against
   internal markup. Such an override is written against one specific DOM
   structure and breaks silently when it changes.

**Why:** a `[class*='…']` override that worked yesterday breaks tomorrow when
the component adds a wrapper or renames an internal class — and you won't get a
type error, just a visually broken layout. Always start at the top of the
ladder; descend one rung only when the rung above has no handle.

---

## Color & shape

### Use semantic tokens, never raw hex or private tokens

❌ `color: #1677FF`
❌ `background: var(--g-color-private-blue-500)`
✓ `color: var(--g-color-text-link)`
✓ `background: var(--g-color-base-brand)`

**Why:** Gravity UI's color system is two-layered. The *private* layer
(`--g-color-private-<hue>-<step>`) is the raw palette — an implementation
detail that can change, never reference it directly. The *semantic* layer
(`--g-color-{group}-{role}`) encodes intent and is theme-aware. Use it:

- backgrounds/fills: `--g-color-base-*` (`base-background`, `base-brand`,
  `base-generic`, `base-danger-*`, …)
- text/icons: `--g-color-text-*` (`text-primary`, `text-secondary`, `text-hint`,
  `text-brand`, `text-link`, …)
- borders/lines: `--g-color-line-*` (`line-generic`, `line-brand`, `line-focus`,
  `line-danger`)
- effects: `--g-color-sfx-*` (`sfx-shadow`, `sfx-veil`, `sfx-fade`)

For text on a brand/colored background, use `--g-color-text-brand-contrast`
(not the plain brand color — it has no contrast guarantee).

### Border radius uses a token, never a hard-coded `px`

❌ `border-radius: 8px`
✓ `border-radius: var(--g-border-radius-m)`

**Why:** the scale is `--g-border-radius-{xs|s|m|l|xl}`. Components expose
their own radius variable on the same scale (`--g-button-border-radius`,
`--g-card-border-radius`, `--g-modal-border-radius`, …) so you can tune one
component without moving the global scale. Use a token, always.

---

## Component-prop traps (cross-cutting)

### `Button` uses `view`, not `variant` / `color`

❌ `<Button variant="primary">` / `<Button color="primary">`
✓ `<Button view="action">` (also `outlined`, `flat`, `raised`, `normal`,
   `special`, `clear`)

### `Icon` takes an object via `data`, never a string name

❌ `<Icon name="check" />` / `<Icon data="Check" />`
✓ `<Icon data={CheckIcon} size={16} />`

**Why:** `Icon` (from `@gravity-ui/uikit`) is the *renderer*; the glyphs live
in `@gravity-ui/icons` as React components. There is no `name` prop. Pass the
imported component object through `data`. Never guess an icon name — use
`scripts/icon-image-search.sh` (reverse image search) or look it up at
`gravity-ui.com/icons`. See `references/icons.md`.

---

## When in doubt

1. Read `references/theming.md` (full token tables) and
   `references/layout.md` (spacing scale, breakpoints).
2. Read the chosen package's `dist/docs/INDEX.md` for component-specific props.
3. If still unsure, ask the user rather than guessing — invented APIs are the
   single biggest source of broken Gravity UI code.
