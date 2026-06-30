# Changelog

## Unreleased

### Plantasonic Platform Integration

- Added explicit local dependencies for `@plantasonic/platform` and `@plantasonic/platform-types` so Signal 9 consumes the frozen Platform SDK and shared contracts as product-app dependencies.
- Kept Signal 9 theme files app-owned: `src/styles/signal9-theme.css`, `src/styles/preset-themes.css`, and `src/theme/`.
- Deferred Design System import replacement because the current Platform SDK does not expose shell, instrument, Creative Workspace, CSS, SCSS, or token entrypoints.
- Deferred engine, demo mount, soundtrack, lore, content, and runtime import changes per `docs/PLATFORM_INTEGRATION_PLAN.md`.
- Added repo-local npm config so `npm install` avoids sibling package prepare scripts and unused Design System CLI bin links.
- Updated npm scripts to call local TypeScript and Vite entrypoints directly so validation works with npm installs that skip bin links.
- Fixed a browser timer type annotation in `src/startup/LoadingScreen.ts` so the Phase 1 typecheck baseline passes without changing runtime behavior.
- Added `docs/PLATFORM_IMPORT_MAP.md` with keep / promote / replace / defer decisions for Platform, demo, Design System, engine, and local shim imports.
- Established the Signal 9 app git baseline while excluding the handoff RTF and stale pnpm lock from source control.
