# TanStack Start + shadcn/ui

This is a template for a new TanStack Start project with React, TypeScript, and shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```

## Testing

Unit and component tests use Vitest with React Testing Library (jsdom).

```bash
bun run test        # run once
bun run test:watch  # watch mode
```

Put tests next to the code under `src/` as `*.test.ts(x)` or `*.spec.ts(x)`. Shared setup (jest-dom matchers, cleanup) lives in `src/test/setup.ts`.

### End-to-end

Browser tests use Playwright and live in `e2e/` as `*.e2e.ts`. Playwright builds the app and serves it with `vite preview` on `http://127.0.0.1:4173` (reused locally if already running).

```bash
bunx playwright install chromium  # once: download the browser
bun run test:e2e                  # all e2e tests (Chromium)
bun run test:e2e:smoke            # @smoke tests only (what CI runs)
bun run test:e2e:headed           # watch the browser
bun run test:e2e:ui               # Playwright UI mode
```

Reports go to `playwright-report/`; traces and screenshots of failures go to `test-results/`.

## CI

`.github/workflows/ci.yml` runs Biome, typecheck, unit tests, the production build, a check that the build left no generated-file changes, then the Chromium smoke suite. Failure diagnostics are uploaded as the `playwright-diagnostics` artifact.

## Linting and formatting

[Biome](https://biomejs.dev) handles formatting, linting, import sorting, and Tailwind class sorting (config in `biome.json`).

```bash
bun run check          # format + lint + imports, read-only
bun run check --write  # apply safe fixes
```

A Husky pre-commit hook runs Biome on staged files (via lint-staged), then `typecheck` and `test`.
