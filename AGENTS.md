<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Kino XII project rules

## Stack

- Use Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, and React Compiler.
- Before changing framework behavior, read the relevant installed documentation in `node_modules/next/dist/docs/`.
- Use the `@/*` alias for imports from `src`.
- Do not introduce `any` to bypass type errors.
- Do not add dependencies when the existing stack can implement the feature clearly.

## Design

- Treat 1920×1080 as the primary Figma reference viewport.
- Match the supplied Figma dimensions, spacing, colors, typography, and alignment at that viewport.
- Do not invent separate mobile or tablet layouts unless explicitly requested.
- Fluid containers and resizing behavior are allowed when requested or needed to prevent clipping.
- Use fixed dimensions when they are intentional design constraints, such as poster frames, modals, and expanded cards.
- Avoid duplicating the same sizing value in JavaScript and Tailwind classes.
- Keep hover effects subtle. Do not move controls unless movement is part of the supplied design.
- Respect `prefers-reduced-motion`.

## Tailwind and global CSS

- Use Tailwind utilities as the primary styling approach.
- Use CSS Modules only when the styling cannot be expressed clearly with Tailwind.
- Keep `src/app/globals.css` limited to:
  - the Tailwind import;
  - document-level defaults;
  - font configuration;
  - reusable semantic design tokens.
- Add repeated colors as semantic Tailwind theme variables.
- Prefer existing tokens such as `bg-page`, `bg-input`, `text-brand`, `text-success`, and `text-status`.
- Do not create a global token for a value used only once.

## Typography and images

- Archivo is the project font and must remain configured through `--font-sans`.
- Use `next/image` for posters, backdrops, and avatars.
- Explicitly allow new remote image hosts in `next.config.ts`.
- Place images inside stable containers so source dimensions do not change card dimensions.
- Use `object-cover` when images must fill a fixed frame.
- Give posters and avatars useful alternative text.
- Use an empty `alt` value for decorative backdrops.

## Project structure

- Keep route files in `src/app` small. They should fetch data and compose feature components.
- Put domain-specific code under `src/features/<feature>`.
- Put application-wide shared components under `src/components`.
- Keep feature API functions in that feature’s `api.ts`.
- Keep API response and domain types in that feature’s `types.ts`.
- Extract shared behavior when multiple components need it.
- Do not create empty folders or speculative abstractions.
- Use kebab-case filenames and PascalCase component names.

## React and Next.js

- Keep Server Components as the default.
- Add `"use client"` only for state, effects, event handlers, local storage, browser APIs, or interactive components.
- Do not move an entire page to the client when only one child needs interactivity.
- Keep independent server requests parallel with `Promise.all`.
- Let independent landing-page sections fail gracefully instead of failing the entire page.
- Do not add Next.js route handlers merely to proxy an existing Laravel endpoint.
- Avoid unnecessary `useMemo` and `useCallback`; React Compiler is enabled.
- Use them only when stable identity is required by an effect or integration.

## Navbar

- Keep the navbar transparent and layered over the hero or page artwork.
- Background artwork belongs to the page or hero, not the navbar.
- The logo must navigate to the home route.
- Keep navbar content aligned with the page’s centered content system.
- Do not add placeholder destinations or unrequested functionality.

## Laravel API

- Use the existing Laravel API directly.
- Read the base URL from `NEXT_PUBLIC_LARAVEL_API_URL`.
- Build URLs through `src/config/api.ts`.
- Never repeat the API base URL inside feature components.
- Send `Accept: application/json`.
- Use JSON only for JSON endpoints.
- Use `FormData` for endpoints containing file uploads.
- Do not manually set `Content-Type` for `FormData`.
- Encode dynamic URL segments.
- Use movie slugs for movie endpoints where the API defines the slug as the path key.
- Keep API types aligned with the real response contract.

## Server and client data

- Fetch public landing-page data in Server Components.
- The access token currently lives in browser `localStorage`.
- Server Components cannot read the localStorage token.
- Personalized fields such as `isNotified` must be refreshed from the browser after authentication is available.
- Do not assume an unauthenticated server request contains personalized state.
- Prefer successful API response data over reconstructing server state locally.

## Authentication

- Store and remove the bearer token only through the existing auth API helpers.
- Send protected requests with `Authorization: Bearer <token>`.
- Never log, render, or commit tokens.
- Update the shared auth provider after login or registration.
- On logout, clear both the token and shared user state.
- If a logged-out user attempts a protected action:
  - preserve the pending action;
  - open the login modal;
  - replay the action after successful login.
- If a protected request returns `401`:
  - clear the expired token and user state;
  - open the login modal;
  - replay the pending action after login.
- A `401` from `/login` means invalid credentials, not an expired existing session.

## Error handling

- Treat `422` with `errors` as field-validation errors.
- Map validation errors to their matching form fields.
- Treat `422` with only `message` as a business-rule error and display the message.
- Treat `401` as an authentication failure.
- Treat `403` as an authorization or ownership problem.
- Treat `404` as a missing resource.
- Treat `409` as a conflict requiring fresh server data.
- Treat network failures and `500` responses as retryable errors.
- Never show a successful state before the request succeeds.
- Disable or guard controls while their request is running.
- Show a useful retry state when a request fails.

## Movie behavior

- Featured movies belong in the hero carousel.
- Coming-soon movies have no sessions and must never navigate to seat selection.
- “Notify Me” must use the protected Laravel notification endpoint.
- `isNotified` belongs to the signed-in user; it is not global for every user.
- Show “Reminder set” only after:
  - the notification request succeeds; or
  - authenticated API data returns `isNotified: true`.
- Keep unimplemented “See all”, ticket, and session controls non-navigational until their behavior is requested.

## Carousel behavior

- Keep carousel content centered with the requested maximum width.
- Position navigation arrows relative to the carousel container, not the viewport.
- Determine navigation availability from `scrollWidth`, `clientWidth`, and `scrollLeft`.
- Recalculate navigation state when the carousel resizes.
- Do not hardcode navigation visibility based on the number of movies.
- Carousel dragging must ignore interactive descendants such as buttons, links, inputs, selects, and textareas.
- Use scroll snapping when appropriate.
- Hide the native scrollbar when required by the design.
- Use a transparency mask for the fading edge instead of a wide blur overlay.
- Source image dimensions must not affect card dimensions.
- Preserve keyboard focus styles and accessible labels.

## Accessibility

- Use semantic `nav`, `main`, `section`, `article`, heading, form, label, button, and link elements.
- Use buttons for actions and links for navigation.
- Do not attach click handlers to non-interactive elements.
- Every input must have a label.
- Every icon-only button must have an accessible name.
- Mark decorative icons and images appropriately.
- Preserve visible keyboard focus states.
- Announce important asynchronous errors and status changes.
- Disabled controls must accurately represent unavailable behavior.

## Environment files

- Keep `.env.local` untracked.
- Keep `.env.example` tracked.
- Update `.env.example` when introducing a new environment variable.
- Never commit API tokens, passwords, private keys, or user-specific data.
- Do not duplicate environment values inside source files.
- Keep `.gitignore` and `AGENTS.md` tracked.

## Validation

Before reporting implementation work as complete, run:

```bash
npm run lint
npm run build
git diff --check
```
