# Documentation project instructions

This is a documentation site built on [Fumadocs](https://fumadocs.dev) and Next.js.

## About this project

- Pages are MDX files with YAML frontmatter in `content/docs`
- Navigation lives in `content/docs/meta.json`
- Chrome theme lives in `app/global.css` (Fumadocs CSS variables)
- In-page app mockups use `.sw-*` classes and tokens in `app/shopwrk-ui.css`
- Run `pnpm dev` to preview locally
- Run `pnpm build` before merging

## Design system

- Change color, spacing, type, or radius in Fumadocs variables (`--color-fd-*`) or ShopWrk tokens (`--sw-*`)
- Keep primary `#f96010` and shell `#090909` in sync across `global.css` and `shopwrk-ui.css`
- New pages should use Fumadocs / Mintlify-compatible components (`Card`, `Tabs`, `Accordion`, `Steps`, `Note`)
- In-page app mockups use `.sw-*` classes. Do not add inline colors or pixel values
- Do not add one-off CSS for a single page. Add a token or a `.sw-*` class instead

## Terminology

{/* Add product-specific terms and preferred usage */}

## Style preferences

- Use active voice and second person ("you")
- Keep sentences concise — one idea per sentence
- Use sentence case for headings
- Bold for UI elements: Click **Settings**
- Code formatting for file names, commands, paths, and code references

## Content boundaries

{/* Define what should and shouldn't be documented */}
