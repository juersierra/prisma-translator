import type { ParsedQuery } from '@prisma-translator/types';

const STORAGE_KEY = 'prisma-translator:query';

const defaultQuery = `user.findMany({
  where: { published: true },
  select: {
    id: true,
    email: true,
    name: true
  }
})`;

function loadQuery(): string {
  if (typeof localStorage === 'undefined') return defaultQuery;
  return localStorage.getItem(STORAGE_KEY) ?? defaultQuery;
}

let queryText = $state(loadQuery());
let parsedQuery = $state<ParsedQuery | null>(null);

export const queryStore = {
  get text() { return queryText; },
  set text(v: string) {
    queryText = v;
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, v);
  },
  get parsed() { return parsedQuery; },
  set parsed(v: ParsedQuery | null) { parsedQuery = v; },
};
