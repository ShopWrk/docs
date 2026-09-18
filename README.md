# ShopWrk docs

Help for running a ShopWrk shop. Built with [Fumadocs](https://fumadocs.dev) and Next.js, hosted on Vercel at [docs.shopwrk.com](https://docs.shopwrk.com).

## Local development

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. `/` redirects to `/introduction`.

Ask AI needs a Vercel AI Gateway key:

```bash
cp .env.example .env.local
```

Set `AI_GATEWAY_API_KEY`. Production uses Vercel OIDC when the project is linked.

## Content

- Pages live in `content/docs` as MDX
- Sidebar order is `content/docs/meta.json`
- Mintlify component names still work (`CardGroup`, `Note`, `Warning`, `Steps`, `Tabs`, `AccordionGroup`)
- App UI mockups use `.sw-*` classes from `app/shopwrk-ui.css`
- Videos: `<CapEmbed src="https://cap.so/embed/..." />`

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm types:check` | Typecheck |

## LLM routes

| URL | Purpose |
| --- | --- |
| `/llms.txt` | Page index |
| `/llms-full.txt` | Full corpus |
| `/introduction.md` | Per-page markdown |
| `/api/mcp` | MCP server |
