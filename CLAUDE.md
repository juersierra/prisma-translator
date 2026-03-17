# Prisma Translator — Claude Code Guide

## Project overview
A client-side tool that emulates Prisma query behavior: parse a Prisma schema and a query written in Prisma Client syntax, infer the TypeScript return type, and generate mock data matching that type. All core logic runs in the browser — no real database involved.

## Monorepo structure
```
prisma-translator/
├── apps/
│   ├── web/     — SvelteKit frontend (main app)
│   └── api/     — Hono API (Phase 3 placeholder, not active)
├── packages/
│   └── types/   — shared TypeScript types (@prisma-translator/types)
└── package.json — Bun workspaces root
```

## Stack
- **Runtime:** Bun
- **Frontend:** SvelteKit 2 + Svelte 5 (runes) + Tailwind CSS 3 + Monaco Editor
- **Backend:** Hono on Bun (placeholder only — not used in Phase 1)
- **Shared types:** `packages/types`
- **Deployment:** Railway (both apps as separate services)
- **Adapter:** `@sveltejs/adapter-node` (required for Railway)

## Key dependencies (web app)
| Package | Purpose |
|---|---|
| `@mrleebo/prisma-ast` | Parse Prisma schema files into AST |
| `acorn` | Parse JS/Prisma Client query strings (no eval) |
| `@faker-js/faker` | Generate mock data from inferred types |
| `monaco-editor` | In-browser code editor with syntax highlighting |
| `lucide-svelte` | Icons |

## Core engine (`apps/web/src/lib/core/`)
- `engine.ts` — orchestrator: `parseSchema → parseQuery → inferReturnType → generateMockData`
- `schema-parser.ts` — wraps `@mrleebo/prisma-ast`, produces internal model representation
- `query-parser.ts` — uses `acorn` to walk query AST safely (no `eval`)
- `type-inference.ts` — walks AST to produce a TypeScript type string
- `mock-generator.ts` — uses `@faker-js/faker` to produce data matching the inferred type
- `parse-schema-api.ts` — API layer for schema parsing (bridges to types package)

## Stores (`apps/web/src/lib/stores/`)
Svelte 5 rune-based stores (`.svelte.ts` files using `$state`):
- `schema.svelte.ts` — current Prisma schema text
- `query.svelte.ts` — current query text
- `output.svelte.ts` — inferred type + mock data output

## Components (`apps/web/src/lib/components/`)
- `MonacoEditor.svelte` — reusable Monaco wrapper
- `SchemaPanel.svelte` — left panel, schema editor
- `QueryPanel.svelte` — center panel, query editor
- `OutputPanel.svelte` — right panel, type + mock output
- `Toolbar.svelte` — top bar with actions

## Development
```bash
# Run the web app (use full bun path — bun may not be in PATH in tool context)
/Users/juersierra/.bun/bin/bun run --filter './apps/web' dev

# Run API (placeholder)
/Users/juersierra/.bun/bin/bun run --filter './apps/api' dev

# Build
/Users/juersierra/.bun/bin/bun run --filter './apps/web' build
```

## Known gotchas
- `apps/web/package.json` must have `"type": "module"` or Vite fails to load the SvelteKit ESM plugin.
- `app.css`: `@import` statements must come **before** `@tailwind` directives.
- `apps/web/tsconfig.json` should extend `.svelte-kit/tsconfig.json` (SvelteKit-generated).
- Bun is not in the shell PATH when Claude Code runs tools — always use the full path `/Users/juersierra/.bun/bin/bun`.

## Roadmap
- **Phase 1 (current):** Schema parsing, query validation, type inference, mock data, 3-panel UI
- **Phase 2:** Full query operations (relations, nested selects), autocomplete, shareable URLs
- **Phase 3:** Live DB queries via Hono API (sandboxed, read-only by default)
