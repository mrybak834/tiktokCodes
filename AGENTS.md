# Repository Agent Guide

## Project Overview
- **Name:** Canvas Runner — a minimal Webpack-powered 2D canvas playground.
- **Purpose:** Demonstrate a glowing sprite gliding across an animated grid that responds to keyboard input while showcasing a lightweight rendering loop.
- **Primary Stack:** JavaScript (ES modules), Webpack 5, Babel, HTML Canvas, Playwright for end-to-end checks.

## Key Directories & Files
- `src/main.js` – bootstraps the canvas app, manages input handling, and renders the animation loop.
- `src/styles/` – houses modular CSS used by the canvas and UI wrapper.
- `public/` – static assets served alongside the bundle (e.g., HTML shell).
- `tests/` – Playwright specs; extend here for interaction or regression tests.
- `webpack.config.js` & `playwright.config.js` – build and test configuration entry points.

## Development Workflow
1. Install dependencies with `npm install`.
2. Start local development via `npm run start` (serves at `http://localhost:5173`).
3. Produce a production bundle with `npm run build`; artifacts emit to `dist/`.
4. Run browser automation with `npm run test:e2e` before submitting significant UI changes.
5. Keep lockfiles (`package-lock.json`) in sync with dependency updates.

## Code Quality Expectations
- Prefer small, composable functions and avoid introducing global state beyond the animation loop.
- Keep canvas rendering performant: use requestAnimationFrame and batch draw calls when practical.
- Update or add Playwright specs when behavior changes; colocate fixtures inside `tests/fixtures` if you create them.
- Follow existing ESLint/Prettier conventions if config files appear; otherwise stick to 2-space indentation and semicolon-terminated statements.
- Document noteworthy constants or math in comments directly above their usage.

## Agent Directives
- **Core Directive:** Run a fresh web search for every prompt to gather the latest documentation or examples relevant to the task at hand.
- Note any external sources consulted (including search queries) in your work log or PR discussion when applicable.
- Keep PR summaries concise, highlighting only the essential functional or documentation changes.
- Ensure all commands and scripts referenced in summaries or testing sections are reproducible from the repository root.
