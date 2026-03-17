import type { ParsedSchema, InferenceResult, ValidationError } from '@prisma-translator/types';
import { parseQuery } from './query-parser';
import { inferReturnType } from './type-inference';
import { generateMockData } from './mock-generator';

export function runEngine(
  schema: ParsedSchema,
  queryText: string,
  mockCount = 3
): InferenceResult {
  const { query, errors: queryErrors } = parseQuery(queryText);

  if (!query || queryErrors.length > 0) {
    return { success: false, errors: queryErrors };
  }

  const { typeString, errors: typeErrors } = inferReturnType(schema, query);

  if (typeErrors.length > 0) {
    return { success: false, errors: typeErrors };
  }

  const mockData = generateMockData(schema, query, mockCount);

  return { success: true, typeString, mockData };
}
