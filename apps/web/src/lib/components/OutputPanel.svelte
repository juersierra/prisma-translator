<script lang="ts">
  import Editor from './Editor.svelte';
  import { untrack } from 'svelte';
  import { outputStore } from '$lib/stores/output.svelte';
  import type { AppTab } from '@prisma-translator/types';
  import { RefreshCw, AlertCircle } from 'lucide-svelte';
  import { generateMockData } from '$lib/core/mock-generator';
  import { schemaStore } from '$lib/stores/schema.svelte';
  import { parseQuery } from '$lib/core/query-parser';
  import { queryStore } from '$lib/stores/query.svelte';

  const tabs: { id: AppTab; label: string }[] = [
    { id: 'type', label: 'Type' },
    { id: 'example', label: 'Example' },
    { id: 'errors', label: 'Errors' },
  ];

  function regenerateMock() {
    if (!schemaStore.parsed) return;
    const { query } = parseQuery(queryStore.text);
    if (!query) return;
    const mockData = generateMockData(schemaStore.parsed, query, outputStore.mockCount);
    if (outputStore.result?.success) {
      outputStore.result = { ...outputStore.result, mockData };
    }
  }

  // Auto-regenerate mock data when count changes (only when result is a success).
  // `untrack` prevents result from being a reactive dependency — avoids write loop.
  $effect(() => {
    outputStore.mockCount; // track only count
    untrack(() => {
      if (outputStore.result?.success) regenerateMock();
    });
  });

  // Auto-switch to errors tab when result has errors; back to type when resolved.
  // Isolated in its own effect — no read/write loop with the analysis effect.
  $effect(() => {
    if (outputStore.result?.success === false) {
      outputStore.tab = 'errors';
    } else if (outputStore.result?.success === true && outputStore.tab === 'errors') {
      outputStore.tab = 'type';
    }
  });

  const mockJson = $derived(
    outputStore.result?.success
      ? JSON.stringify(outputStore.result.mockData, null, 2)
      : ''
  );

  const errorCount = $derived(
    outputStore.result?.success === false ? outputStore.result.errors.length : 0
  );
</script>

<div class="flex flex-col h-full">
  <!-- Tabs -->
  <div class="flex items-center border-b border-surface-700 bg-surface-900">
    {#each tabs as tab}
      <button
        onclick={() => outputStore.tab = tab.id}
        class="px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors relative
          {outputStore.tab === tab.id
            ? 'text-violet-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-violet-400'
            : 'text-gray-500 hover:text-gray-300'}"
      >
        {tab.label}
        {#if tab.id === 'errors' && errorCount > 0}
          <span class="ml-1 text-red-400">{errorCount}</span>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Content -->
  <div class="flex-1 min-h-0 overflow-hidden">
    {#if outputStore.tab === 'type'}
      {#if outputStore.result?.success}
        <Editor
          value={outputStore.result.typeString}
          language="typescript"
          readOnly={true}
        />
      {:else}
        <div class="flex items-center justify-center h-full text-gray-600 text-sm">
          Enter a valid schema and query to see the return type.
        </div>
      {/if}

    {:else if outputStore.tab === 'example'}
      <div class="flex flex-col h-full">
        {#if outputStore.result?.success}
          <div class="flex items-center justify-between px-4 py-2 border-b border-surface-700 bg-surface-900">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500">Count:</span>
              <input
                type="number"
                min="1"
                max="20"
                bind:value={outputStore.mockCount}
                class="w-16 text-xs bg-surface-800 border border-surface-600 rounded px-2 py-0.5 text-gray-300"
              />
            </div>
            <button
              onclick={regenerateMock}
              class="flex items-center gap-1 text-xs px-2 py-1 rounded border border-surface-600 hover:bg-surface-700 text-gray-400 transition-colors"
            >
              <RefreshCw size={11} />
              Regenerate
            </button>
          </div>
          <div class="flex-1 min-h-0">
            <Editor value={mockJson} language="json" readOnly={true} />
          </div>
        {:else}
          <div class="flex items-center justify-center h-full text-gray-600 text-sm">
            No example data available.
          </div>
        {/if}
      </div>

    {:else if outputStore.tab === 'errors'}
      <div class="p-4 space-y-3 overflow-y-auto h-full">
        {#if outputStore.result?.success === false && outputStore.result.errors.length > 0}
          {#each outputStore.result.errors as error}
            <div class="rounded-lg border border-red-900/50 bg-red-950/30 p-4">
              <div class="flex items-start gap-2">
                <AlertCircle size={16} class="text-red-400 mt-0.5 shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-red-300">{error.message}</p>
                  {#if error.location}
                    <p class="text-xs text-gray-500 mt-1">Location: <code class="text-gray-400">{error.location}</code></p>
                  {/if}
                  {#if error.fix}
                    <p class="text-xs text-emerald-400 mt-2">Fix: {error.fix}</p>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        {:else}
          <div class="flex items-center justify-center h-full text-gray-600 text-sm">
            No errors. Your query is valid.
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
