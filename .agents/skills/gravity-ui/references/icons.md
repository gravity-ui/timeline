# Icons — finding the right `@gravity-ui/icons` name

Icon names are hallucinated more often than not. **Never guess.** Find the real
name, then render it correctly.

## By image (screenshot / photo / mock) — preferred

When the user has a picture of the icon — a screenshot, a design mock, a photo —
use **reverse image search**:

```
scripts/icon-image-search.sh <path-to-image>
```

It POSTs the image to `https://gravity-ui.com/api/icons-search` and prints the
closest `@gravity-ui/icons` names. The script infers the content type from the
extension; force it if ambiguous: `--png` / `--jpeg`.

**Image requirements:** send a small image of the icon *alone* — ideally
**square** and tightly cropped to the glyph (no surrounding UI, large
whitespace, or several icons in one shot). A full-page screenshot gives worse
matches, so crop to the icon first if needed.

Workflow:
1. Have the user drop the image into the project, or point you at its path — a
   small, square crop of just the icon.
2. Run the script (it needs `curl`).
3. The response is JSON: `{"results":[{"name","componentName","style","score"}, …]}`
   sorted by descending `score` (0–1). Use **`componentName`** (PascalCase) for
   the import: `import { Sphere } from '@gravity-ui/icons'`.
4. If the top scores are close (within ~0.02) or the image is low-res, show the
   user the top few candidates and ask which one — don't pick the first blindly.
5. Render the chosen component (below).

## When you only have a description (no image)

This skill ships **no text-search endpoint**. To avoid inventing a name:

- Look the icon up on the catalog at `https://gravity-ui.com/icons`.
- If still unclear, ask the user for a screenshot and run image search.

Do not guess a name from memory.

## Rendering the chosen icon

- The glyph set is `@gravity-ui/icons`; the renderer is uikit's `Icon`. Two
  packages, two roles — don't confuse them.
- Import the icon component and pass it via uikit's `Icon` `data` prop:

  ```tsx
  import { Icon } from '@gravity-ui/uikit';
  import { ShieldCheck } from '@gravity-ui/icons';
  import '@gravity-ui/uikit/styles/styles.css';

  <Icon data={ShieldCheck} size={16} />
  ```

- Pass the icon as an **object** (`data={ShieldCheck}`), never as a string key.
- For a custom or brand icon not in the set, import your own SVG and pass it to
  `Icon` — do not expect it to live in `@gravity-ui/icons`.
