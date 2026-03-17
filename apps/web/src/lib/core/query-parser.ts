import * as acorn from 'acorn';
import type { ParsedQuery, PrismaOperation, ValidationError } from '@prisma-translator/types';

const VALID_OPERATIONS: PrismaOperation[] = [
  'findFirst','findUnique','findMany','count','aggregate','groupBy',
  'create','update','delete','upsert','createMany','updateMany','deleteMany'
];

const QUERY_REGEX = /^(\w+)\.(\w+)\s*\(([^]*)\)$/s;

export function parseQuery(queryText: string): { query: ParsedQuery | null; errors: ValidationError[] } {
  // Strip optional `prisma.` prefix and trailing semicolon so both styles work:
  //   user.findMany({})          ← already supported
  //   prisma.user.findMany({});  ← natural Prisma Client style
  const trimmed = queryText.trim().replace(/^prisma\./, '').replace(/;$/, '').trim();
  const match = trimmed.match(QUERY_REGEX);
  if (!match) {
    return {
      query: null,
      errors: [{ message: 'Invalid query format. Expected: modelName.operation({ ... })', fix: 'Example: user.findMany({ where: { id: 1 } })' }]
    };
  }

  const [, modelRaw, operationRaw, argsRaw] = match;
  const model = modelRaw.toLowerCase();
  const operation = operationRaw as PrismaOperation;

  if (!VALID_OPERATIONS.includes(operation)) {
    return {
      query: null,
      errors: [{
        message: `"${operation}" is not a valid Prisma operation.`,
        fix: `Valid operations: ${VALID_OPERATIONS.join(', ')}`
      }]
    };
  }

  let args: Record<string, unknown> = {};
  const trimmedArgs = argsRaw.trim();
  if (trimmedArgs) {
    try {
      // Wrap in parentheses to parse as expression
      const wrapped = `(${trimmedArgs})`;
      const ast = acorn.parse(wrapped, { ecmaVersion: 2020, sourceType: 'module' }) as any;
      args = evalObjectExpression(ast.body[0].expression);
    } catch (e: any) {
      return {
        query: null,
        errors: [{ message: `Could not parse query arguments: ${e?.message}`, fix: 'Ensure the argument is a valid JavaScript object literal.' }]
      };
    }
  }

  return { query: { model, operation, args }, errors: [] };
}

function evalObjectExpression(node: any): any {
  if (!node) return undefined;
  switch (node.type) {
    case 'ObjectExpression':
      return Object.fromEntries(node.properties.map((p: any) => [
        p.key.name ?? p.key.value,
        evalObjectExpression(p.value)
      ]));
    case 'ArrayExpression':
      return node.elements.map(evalObjectExpression);
    case 'Literal':
      return node.value;
    case 'UnaryExpression':
      if (node.operator === '-') return -evalObjectExpression(node.argument);
      return evalObjectExpression(node.argument);
    case 'Identifier':
      if (node.name === 'true') return true;
      if (node.name === 'false') return false;
      if (node.name === 'null') return null;
      if (node.name === 'undefined') return undefined;
      return node.name;
    default:
      return undefined;
  }
}
