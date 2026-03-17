import { getSchema } from '@mrleebo/prisma-ast';
import type { ParsedSchema, PrismaModel, PrismaField, PrismaEnum } from '@prisma-translator/types';

const SCALAR_TYPES = new Set(['String','Int','Float','Boolean','DateTime','Json','BigInt','Bytes','Decimal']);

export function parseSchema(schemaText: string): { schema: ParsedSchema; errors: string[] } {
  const errors: string[] = [];
  try {
    const ast = getSchema(schemaText);
    const models: PrismaModel[] = [];
    const enums: PrismaEnum[] = [];

    // First pass: collect all model and enum names
    const modelNames = new Set<string>();
    const enumNames = new Set<string>();
    for (const node of ast.list) {
      if (node.type === 'model') modelNames.add(node.name);
      if (node.type === 'enum') enumNames.add(node.name);
    }

    for (const node of ast.list) {
      if (node.type === 'model') {
        const fields: PrismaField[] = [];
        for (const prop of node.properties) {
          if (prop.type !== 'field') continue;
          const fieldType = typeof prop.fieldType === 'string' ? prop.fieldType : (prop.fieldType as any).name ?? 'String';
          const isRelation = modelNames.has(fieldType);
          const attrs = prop.attributes ?? [];
          const isId = attrs.some((a: any) => a.name === 'id');
          const isUnique = attrs.some((a: any) => a.name === 'unique');
          const hasDefault = attrs.some((a: any) => a.name === 'default');
          fields.push({
            name: prop.name,
            type: fieldType,
            isRequired: !prop.optional,
            isList: prop.array ?? false,
            isRelation,
            isId,
            isUnique,
            hasDefault,
          });
        }
        models.push({ name: node.name, fields });
      }
      if (node.type === 'enum') {
        const values = node.enumerators
          .filter((e: any) => e.type === 'enumerator')
          .map((e: any) => e.name);
        enums.push({ name: node.name, values });
      }
    }
    return { schema: { models, enums }, errors };
  } catch (e: any) {
    errors.push(e?.message ?? 'Failed to parse schema');
    return { schema: { models: [], enums: [] }, errors };
  }
}
