import { faker } from '@faker-js/faker';
import type { ParsedSchema, ParsedQuery, PrismaModel, PrismaField } from '@prisma-translator/types';

export function generateMockData(schema: ParsedSchema, query: ParsedQuery, count = 3): unknown {
  const model = schema.models.find(m => m.name.toLowerCase() === query.model.toLowerCase());
  if (!model) return null;

  const args = query.args as any;
  const select = args?.select as Record<string, unknown> | undefined;
  const include = args?.include as Record<string, unknown> | undefined;

  const generateOne = () => generateMockObject(model, schema, select, include, 0);

  switch (query.operation) {
    case 'findMany':
      return Array.from({ length: count }, generateOne);
    case 'findFirst':
    case 'findUnique':
      return generateOne();
    case 'count':
      return faker.number.int({ min: 0, max: 100 });
    default:
      return generateOne();
  }
}

function generateMockObject(
  model: PrismaModel,
  schema: ParsedSchema,
  select: Record<string, unknown> | undefined,
  include: Record<string, unknown> | undefined,
  depth: number
): Record<string, unknown> {
  const activeFields = select
    ? model.fields.filter(f => select[f.name] === true || (typeof select[f.name] === 'object' && select[f.name] !== null))
    : model.fields.filter(f => !f.isRelation);

  const includeFields: PrismaField[] = [];
  if (!select && include) {
    for (const key of Object.keys(include)) {
      const rel = model.fields.find(f => f.name === key && f.isRelation);
      if (rel) includeFields.push(rel);
    }
  }

  const result: Record<string, unknown> = {};

  for (const field of [...activeFields, ...includeFields]) {
    result[field.name] = generateFieldValue(field, schema, select, include, depth);
  }

  return result;
}

function generateFieldValue(
  field: PrismaField,
  schema: ParsedSchema,
  select: Record<string, unknown> | undefined,
  include: Record<string, unknown> | undefined,
  depth: number
): unknown {
  if (!field.isRequired && !field.isId && faker.datatype.boolean({ probability: 0.2 })) {
    return null;
  }

  if (field.isRelation && depth < 3) {
    const relModel = schema.models.find(m => m.name === field.type);
    if (relModel) {
      const nested = select?.[field.name] ?? include?.[field.name];
      const nestedSelect = (nested as any)?.select;
      const nestedInclude = (nested as any)?.include;
      if (field.isList) {
        return Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () =>
          generateMockObject(relModel, schema, nestedSelect, nestedInclude, depth + 1)
        );
      }
      return generateMockObject(relModel, schema, nestedSelect, nestedInclude, depth + 1);
    }
  }

  const enumDef = schema.enums.find(e => e.name === field.type);
  if (enumDef) {
    const val = faker.helpers.arrayElement(enumDef.values);
    return field.isList ? [val] : val;
  }

  const val = generateScalar(field.name, field.type);
  return field.isList ? [val] : val;
}

function generateScalar(fieldName: string, type: string): unknown {
  const name = fieldName.toLowerCase();
  switch (type) {
    case 'String':
      if (name.includes('email')) return faker.internet.email();
      if (name.includes('name')) return faker.person.fullName();
      if (name.includes('url') || name.includes('image') || name.includes('avatar')) return faker.internet.url();
      if (name.includes('title')) return faker.lorem.sentence(4);
      if (name.includes('content') || name.includes('body') || name.includes('description')) return faker.lorem.paragraph();
      if (name.includes('phone')) return faker.phone.number();
      if (name.includes('address')) return faker.location.streetAddress();
      if (name.includes('city')) return faker.location.city();
      if (name.includes('country')) return faker.location.country();
      if (name.includes('password') || name.includes('hash') || name.includes('token')) return faker.string.alphanumeric(32);
      return faker.lorem.words(3);
    case 'Int':
      return faker.number.int({ min: 1, max: 1000 });
    case 'Float':
    case 'Decimal':
      return parseFloat(faker.number.float({ min: 0, max: 1000, fractionDigits: 2 }).toFixed(2));
    case 'Boolean':
      return faker.datatype.boolean();
    case 'DateTime':
      return faker.date.recent().toISOString();
    case 'Json':
      return { key: faker.lorem.word(), value: faker.lorem.word() };
    case 'BigInt':
      return faker.number.int({ min: 1, max: 9007199254740991 });
    case 'Bytes':
      return faker.string.alphanumeric(16);
    default:
      return faker.lorem.word();
  }
}
