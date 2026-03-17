import type { ParsedSchema, ParsedQuery, PrismaModel, PrismaField, ValidationError } from '@prisma-translator/types';

export function inferReturnType(
  schema: ParsedSchema,
  query: ParsedQuery
): { typeString: string; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  const model = schema.models.find(m => m.name.toLowerCase() === query.model.toLowerCase());
  if (!model) {
    return {
      typeString: 'never',
      errors: [{
        message: `Model "${query.model}" not found in schema.`,
        fix: `Available models: ${schema.models.map(m => m.name).join(', ')}`
      }]
    };
  }

  const args = query.args as any;
  const select = args?.select as Record<string, unknown> | undefined;
  const include = args?.include as Record<string, unknown> | undefined;

  // Validate select/include fields
  if (select) {
    for (const key of Object.keys(select)) {
      if (!model.fields.find(f => f.name === key)) {
        errors.push({
          message: `Field "${key}" does not exist on model "${model.name}".`,
          location: `select.${key}`,
          fix: `Available fields: ${model.fields.map(f => f.name).join(', ')}`
        });
      }
    }
  }

  if (errors.length > 0) return { typeString: 'never', errors };

  const innerType = buildModelType(model, schema, select, include, 0);

  let typeString: string;
  switch (query.operation) {
    case 'findMany':
    case 'createMany':
      typeString = `${innerType}[]`;
      break;
    case 'findFirst':
    case 'findUnique':
      typeString = `${innerType} | null`;
      break;
    case 'count':
      typeString = 'number';
      break;
    case 'delete':
    case 'update':
    case 'upsert':
    case 'create':
      typeString = innerType;
      break;
    default:
      typeString = innerType;
  }

  return { typeString, errors: [] };
}

function buildModelType(
  model: PrismaModel,
  schema: ParsedSchema,
  select: Record<string, unknown> | undefined,
  include: Record<string, unknown> | undefined,
  depth: number
): string {
  const activeFields = select
    ? model.fields.filter(f => select[f.name] === true || (typeof select[f.name] === 'object' && select[f.name] !== null))
    : model.fields.filter(f => !f.isRelation);

  // If include is specified (without select), add relation fields
  const includeFields: PrismaField[] = [];
  if (!select && include) {
    for (const key of Object.keys(include)) {
      const rel = model.fields.find(f => f.name === key && f.isRelation);
      if (rel) includeFields.push(rel);
    }
  }

  const allFields = [...activeFields, ...includeFields];
  const lines: string[] = [];

  for (const field of allFields) {
    const tsType = resolveFieldType(field, schema, select, include, depth);
    const optional = !field.isRequired ? '?' : '';
    lines.push(`  ${field.name}${optional}: ${tsType}`);
  }

  return `{\n${lines.join(';\n')}\n}`;
}

function resolveFieldType(
  field: PrismaField,
  schema: ParsedSchema,
  select: Record<string, unknown> | undefined,
  include: Record<string, unknown> | undefined,
  depth: number
): string {
  if (field.isRelation && depth < 3) {
    const relModel = schema.models.find(m => m.name === field.type);
    if (relModel) {
      const nested = select?.[field.name] ?? include?.[field.name];
      const nestedSelect = (nested as any)?.select;
      const nestedInclude = (nested as any)?.include;
      const inner = buildModelType(relModel, schema, nestedSelect, nestedInclude, depth + 1);
      return field.isList ? `${inner}[]` : `${inner} | null`;
    }
  }

  const scalarMap: Record<string, string> = {
    String: 'string', Int: 'number', Float: 'number', Boolean: 'boolean',
    DateTime: 'Date', Json: 'unknown', BigInt: 'bigint', Bytes: 'Buffer', Decimal: 'number',
  };

  // Check if it's an enum
  const enumDef = schema.enums.find(e => e.name === field.type);
  if (enumDef) {
    const enumType = enumDef.values.map(v => `'${v}'`).join(' | ');
    return field.isList ? `(${enumType})[]` : field.isRequired ? enumType : `${enumType} | null`;
  }

  const base = scalarMap[field.type] ?? 'unknown';
  if (field.isList) return `${base}[]`;
  return field.isRequired ? base : `${base} | null`;
}
