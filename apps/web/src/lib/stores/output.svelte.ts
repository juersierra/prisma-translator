import type { AppTab, InferenceResult } from '@prisma-translator/types';

let activeTab = $state<AppTab>('type');
let result = $state<InferenceResult | null>(null);
let mockCount = $state(3);

export const outputStore = {
  get tab() { return activeTab; },
  set tab(v: AppTab) { activeTab = v; },
  get result() { return result; },
  set result(v: InferenceResult | null) { result = v; },
  get mockCount() { return mockCount; },
  set mockCount(v: number) { mockCount = v; },
};
