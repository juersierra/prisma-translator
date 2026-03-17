<script lang="ts">
  import Editor from './Editor.svelte';
  import { untrack } from 'svelte';
  import { queryStore } from '$lib/stores/query.svelte';
  import { outputStore } from '$lib/stores/output.svelte';
  import { schemaStore } from '$lib/stores/schema.svelte';
  import { runEngine } from '$lib/core/engine';
  import { parseQuery } from '$lib/core/query-parser';
  import { Play } from 'lucide-svelte';

  function handleQueryChange(value: string) {
    queryStore.text = value;
  }

  // Reactively compute result whenever schema or query changes.
  // mockCount is read via untrack() to avoid double-regeneration with OutputPanel's effect.
  $effect(() => {
    const schema = schemaStore.parsed;
    const text = queryStore.text;

    if (!schema || !text.trim()) {
      outputStore.result = null;
      queryStore.parsed = null;
      return;
    }

    const { query } = parseQuery(text);
    queryStore.parsed = query;
    const count = untrack(() => outputStore.mockCount);
    outputStore.result = runEngine(schema, text, count);
  });

  // Force a fresh run with new mock data — distinct from the auto-run above.
  function runAnalysis() {
    const schema = schemaStore.parsed;
    const text = queryStore.text;
    if (!schema || !text.trim()) {
      outputStore.result = null;
      queryStore.parsed = null;
      return;
    }
    const { query } = parseQuery(text);
    queryStore.parsed = query;
    outputStore.result = runEngine(schema, text, outputStore.mockCount);
  }
</script>

<div class="flex flex-col h-full border-r border-surface-700">
  <!-- Header -->
  <div class="flex items-center justify-between px-4 py-2 border-b border-surface-700 bg-surface-900">
    <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Query</span>
    <button
      onclick={runAnalysis}
      class="flex items-center gap-1 text-xs px-2 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white transition-colors"
    >
      <Play size={11} />
      Run
    </button>
  </div>

  <!-- Editor -->
  <div class="flex-1 min-h-0">
    <Editor
      bind:value={queryStore.text}
      language="javascript"
      onChange={handleQueryChange}
      onCmdEnter={runAnalysis}
    />
  </div>
</div>
