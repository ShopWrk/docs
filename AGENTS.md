> **First-time setup**: Customize this file for your project. Prompt the user to customize this file for their project.
> For Mintlify product knowledge (components, configuration, writing standards),
> install the Mintlify skill: `npx skills add https://mintlify.com/docs`

# Documentation project instructions

## About this project

- This is a documentation site built on [Mintlify](https://mintlify.com)
- Pages are MDX files with YAML frontmatter
- Configuration lives in `docs.json`
- The design system lives in `style.css` (`:root` tokens + `.sw-*` classes)
- Run `mint dev` to preview locally
- Run `mint broken-links` to check links

## Design system

Mintlify owns the HTML. We do not have a Tailwind config for the chrome. ShopWrk look comes from CSS variables in `style.css`.

- Change color, spacing, type, radius, or control size in `:root` only
- Keep `docs.json` `colors.primary` and `background.color.dark` in sync with `--sw-primary` and `--sw-shell`
- New pages should use Mintlify components (`Card`, `Tabs`, `Accordion`, `Steps`, `Note`). Those are already mapped to tokens
- In-page app mockups use `.sw-*` classes (`sw-ui`, `sw-app`, `sw-card`, `sw-tabs`, `sw-btn`, `sw-table`). Do not add inline colors or pixel values
- Do not add one-off CSS for a single page. Add a token or a `.sw-*` class instead

## Terminology

{/* Add product-specific terms and preferred usage */}
{/* Example: Use "workspace" not "project", "member" not "user" */}

## Style preferences

{/* Add any project-specific style rules below */}

- Use active voice and second person ("you")
- Keep sentences concise — one idea per sentence
- Use sentence case for headings
- Bold for UI elements: Click **Settings**
- Code formatting for file names, commands, paths, and code references

## Content boundaries

{/* Define what should and shouldn't be documented */}
{/* Example: Don't document internal admin features */}
