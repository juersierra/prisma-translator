import type { ParsedSchema } from '@prisma-translator/types';

export type ParseResult = { schema: ParsedSchema; errors: string[] };

/**
 * Parse Prisma schema via server API (avoids Node.js fs in browser).
 * @mrleebo/prisma-ast uses Node.js fs and cannot run in the browser.
 */
export async function parseSchemaApi(schemaText: string): Promise<ParseResult> {
  try {
    const res = await fetch('/api/parse-schema', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schemaText }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { schema: { models: [], enums: [] }, errors: data.errors ?? ['Parse failed'] };
    }
    return data as ParseResult;
  } catch {
    return { schema: { models: [], enums: [] }, errors: ['Network error'] };
  }
}
