<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project design and implementation rules

- Design and visually validate the interface only for a 1920x1080 viewport unless the user explicitly changes the target. Do not introduce responsive breakpoints or alternate mobile/tablet layouts preemptively.
- Keep the site navbar transparent and layer it over the page or hero artwork. Background images belong to the page or hero, never to the navbar component.
- Build shared interface elements as reusable, semantic components. Use Tailwind CSS utilities as the primary styling approach.
- Keep `globals.css` limited to the Tailwind import, global document defaults, and reusable design tokens. Define repeated project colors as semantic Tailwind theme variables instead of duplicating raw color values in components.
- Use CSS Modules only when complex styling cannot be expressed clearly with Tailwind utilities.
- Keep Server Components as the default. Add Client Components only where interaction, state, or browser APIs are actually required.
- Preserve accessible HTML structure and labels. Do not add placeholder links, click handlers, authentication logic, or other behavior before it is requested.
