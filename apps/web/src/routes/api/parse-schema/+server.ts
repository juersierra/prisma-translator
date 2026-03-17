import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSchema } from '$lib/server/schema-parser';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { schemaText } = await request.json() as { schemaText?: string };
    if (typeof schemaText !== 'string') {
      return json({ schema: { models: [], enums: [] }, errors: ['Invalid request: schemaText must be a string'] }, { status: 400 });
    }
    const result = parseSchema(schemaText);
    return json(result);
  } catch (e) {
    return json(
      { schema: { models: [], enums: [] }, errors: [(e as Error)?.message ?? 'Failed to parse schema'] },
      { status: 500 }
    );
  }
};
