export type PrismaFieldType =
  | 'String'
  | 'Int'
  | 'Float'
  | 'Boolean'
  | 'DateTime'
  | 'Json'
  | 'BigInt'
  | 'Bytes'
  | 'Decimal';

export type PrismaField = {
  name: string;
  type: string;
  isRequired: boolean;
  isList: boolean;
  isRelation: boolean;
  relationTo?: string;
  isId?: boolean;
  isUnique?: boolean;
  hasDefault?: boolean;
};

export type PrismaModel = {
  name: string;
  fields: PrismaField[];
};

export type PrismaEnum = {
  name: string;
  values: string[];
};

export type ParsedSchema = {
  models: PrismaModel[];
  enums: PrismaEnum[];
};

export type PrismaOperation =
  | 'findFirst'
  | 'findUnique'
  | 'findMany'
  | 'count'
  | 'aggregate'
  | 'groupBy'
  | 'create'
  | 'update'
  | 'delete'
  | 'upsert'
  | 'createMany'
  | 'updateMany'
  | 'deleteMany';

export type ParsedQuery = {
  model: string;
  operation: PrismaOperation;
  args: Record<string, unknown>;
};

export type ValidationError = {
  message: string;
  location?: string;
  fix?: string;
};

export type InferenceResult =
  | { success: true; typeString: string; mockData: unknown }
  | { success: false; errors: ValidationError[] };

export type AppTab = 'type' | 'example' | 'errors';
