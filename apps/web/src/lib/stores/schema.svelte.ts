import type { ParsedSchema } from '@prisma-translator/types';

const STORAGE_KEY = 'prisma-translator:schema';

const defaultSchema = `model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
}`;

function loadSchema(): string {
  if (typeof localStorage === 'undefined') return defaultSchema;
  return localStorage.getItem(STORAGE_KEY) ?? defaultSchema;
}

let schemaText = $state(loadSchema());
let parsedSchema = $state<ParsedSchema | null>(null);
let schemaErrors = $state<string[]>([]);

export const schemaStore = {
  get text() { return schemaText; },
  set text(v: string) {
    schemaText = v;
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, v);
  },
  get parsed() { return parsedSchema; },
  set parsed(v: ParsedSchema | null) { parsedSchema = v; },
  get errors() { return schemaErrors; },
  set errors(v: string[]) { schemaErrors = v; },
};
