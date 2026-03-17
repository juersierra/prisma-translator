## Prisma Translator

**Try it: https://prisma-translator.up.railway.app/**

**Prisma Translator** is a developer tool that lets you paste a Prisma schema and a Prisma-style query, then instantly see:

- **Inferred TypeScript return type** for the query
- **Mock data preview** that matches the inferred type
- **Clear validation errors** when the query does not match the schema

All core logic runs **entirely in the browser** – no database or backend is required for the main experience. A separate backend service is planned for an optional **live database** mode.

> Status: **Early preview / Phase 1** — focused on schema parsing, query validation for read operations, type inference, and mock data generation.

---

## Why this exists

When working with Prisma, developers constantly ask:

- **“What shape will this query return?”**
- **“Is this query valid against my schema?”**
- **“What would the actual data look like?”**

Today, answering those questions usually means:

- Running the app and hitting an endpoint
- Digging through generated types in your editor
- Cross‑referencing the Prisma docs

Prisma Translator removes that friction by giving you **instant feedback** on your queries in a dedicated playground, without touching your application code or database.

---

## Features

- **Schema input**
  - Paste your `schema.prisma` directly into the app
  - Schema is parsed into an internal model (models, fields, relations, enums)
  - Inline schema errors with line numbers and descriptions

- **Query input**
  - Write Prisma‑style queries like `user.findFirst({ where: { email: "admin@example.com" } })`
  - Supports key operations like `findFirst`, `findUnique`, `findMany` (more coming in later phases)

- **Type inference**
  - Shows the **exact TypeScript return type** for a valid query
  - Respects `select` narrowing and `include` expansion
  - Handles list vs. single‑record shapes (`findMany` vs `findFirst` / `findUnique`)

- **Mock data generation**
  - Generates **realistic mock data** that matches the inferred return type
  - Uses `@faker-js/faker` with sensible mappings for Prisma scalar types and enums
  - Supports nested relations for `include` / relational fields

- **Error handling**
  - Structured, actionable error messages when:
    - Models or fields don’t exist in the schema
    - Operations are invalid for a given model
    - `where` / `select` / `include` shapes don’t match the schema
  - Each error includes a short description, location, and concrete fix suggestion

- **Future (planned)**
  - Full CRUD / aggregation support (`create`, `update`, `delete`, `count`, `aggregate`, `groupBy`, etc.)
  - Autocompletion in the query editor
  - Shareable URLs for schema + query
  - Optional live database execution via a sandboxed backend

---

## Architecture

This repo is a **Bun workspaces monorepo**:

- `apps/web` – SvelteKit 2 + Svelte 5 frontend (main app)
- `apps/api` – Hono/Bun backend (placeholder for future live DB feature)
- `packages/types` – Shared TypeScript types (`@prisma-translator/types`)

Core “engine” logic (all client‑side) lives in `apps/web/src/lib/core/`:

- `engine.ts` — orchestrates the full flow:
  - parse schema → parse query → infer return type → generate mock data
- `schema-parser.ts` — wraps `@mrleebo/prisma-ast` into an internal schema model
- `query-parser.ts` — parses Prisma‑style query strings using `acorn` (no `eval`)
- `type-inference.ts` — walks the schema + query AST to build a TypeScript type
- `mock-generator.ts` — uses Faker to produce mock data that matches the type

All of this runs **in the browser** to keep the core experience fast and private.

---

## Tech stack

- **Runtime**: Bun
- **Frontend**: SvelteKit 2, Svelte 5 (runes), Tailwind CSS
- **Editor**: Monaco‑style experience (CodeMirror used internally for now)
- **Parsing**:
  - `@mrleebo/prisma-ast` for Prisma schema parsing
  - `acorn` for safe query parsing (no dynamic evaluation)
- **Mock data**: `@faker-js/faker`
- **UI**: `lucide-svelte`, Tailwind, utility components

---

## Getting started

### Prerequisites

- **Bun** installed (recommended via the official installer)
- **Node.js** 18+ (for tooling)

From the repo root:

```bash
cd prisma-translator
```

Install dependencies with Bun:

```bash
/Users/juersierra/.bun/bin/bun install
```

### Run the web app (dev)

From the repo root:

```bash
/Users/juersierra/.bun/bin/bun run dev
```

This runs the SvelteKit app in `apps/web` using Vite. Open the printed URL (typically `http://localhost:5173`) in your browser.

### Build the web app

```bash
/Users/juersierra/.bun/bin/bun run build
```

### Optional API dev server (future live DB)

The API is a placeholder for the Phase 3 live database feature:

```bash
/Users/juersierra/.bun/bin/bun run dev:api
```

You don’t need this running for the current client‑side experience.

---

## Using the app

### 1. Paste your Prisma schema

1. Open the app in your browser.
2. Paste the contents of your `schema.prisma` into the **Schema** panel.
3. If the schema parses successfully:
   - Parsed models and fields are available to the engine.
4. If there are errors:
   - You’ll see inline error messages with line numbers and descriptions.

### 2. Write a Prisma query

In the **Query** panel, write a Prisma‑style query, e.g.:

```ts
user.findFirst({
  where: { email: "admin@example.com" },
  select: { id: true, email: true, profile: { select: { name: true } } }
})
```

The app parses and validates the query against the parsed schema.

### 3. Inspect types and mock data

- The **Type** view shows the inferred **TypeScript return type** for your query.
- The **Example** view shows **mock JSON data** that matches that type.
- If your query is invalid, the **Errors** view activates with structured error cards describing:
  - What went wrong
  - Where it occurred
  - How to fix it

---

## Roadmap (from PRD)

- **Phase 1 — MVP (current)**
  - Schema parsing and model extraction
  - Query parsing + validation for `findFirst`, `findUnique`, `findMany`
  - Type inference with `select` / `include`
  - Mock data generation with Faker
  - Three‑panel UI with editors and output

- **Phase 2 — Full query support**
  - CRUD + bulk operations
  - `count`, `aggregate`, `groupBy`
  - Query editor autocompletion
  - Shareable URLs

- **Phase 3 — Live database**
  - Backend service to run queries against a real database
  - Sandboxed, read‑only by default (write opt‑in)
  - Clear connection and execution error reporting

- **Phase 4 — Polish & community**
  - Dark/light theme, keyboard shortcuts
  - Docs and examples
  - Public launch and feedback loop

---

## Contributing

This project is early and evolving quickly. If you’d like to contribute:

- Open an issue describing the bug, enhancement, or question.
- For code changes, include:
  - A clear description of the behavior or API you’re changing
  - Before/after notes or small test cases where possible

Tooling (in `apps/web`):

- `bun run --filter './apps/web' lint` – lint the web app
- `bun run --filter './apps/web' check` – Svelte + TypeScript checks

---

## License

License information is not finalized yet. Until a formal license is added, treat this repository as **source‑available for evaluation and collaboration**, not for production or commercial use.

