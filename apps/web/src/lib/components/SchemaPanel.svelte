<script lang="ts">
  import Editor from './Editor.svelte';
  import { schemaStore } from '$lib/stores/schema.svelte';
  import { parseSchemaApi } from '$lib/core/parse-schema-api';
  import { ChevronRight } from 'lucide-svelte';

  let parseTimeout: ReturnType<typeof setTimeout>;

  function debouncedParse(text: string) {
    clearTimeout(parseTimeout);
    parseTimeout = setTimeout(async () => {
      const { schema, errors } = await parseSchemaApi(text);
      schemaStore.parsed = schema;
      schemaStore.errors = errors;
    }, 150);
  }

  function handleSchemaChange(value: string) {
    schemaStore.text = value;
    debouncedParse(value);
  }

  // Parse on first load and when schema text changes
  $effect(() => {
    const text = schemaStore.text;
    debouncedParse(text);
    return () => clearTimeout(parseTimeout);
  });

  let expanded = $state<Set<string>>(new Set());
  function toggleModel(name: string) {
    const next = new Set(expanded);
    next.has(name) ? next.delete(name) : next.add(name);
    expanded = next;
  }
</script>

<div class="flex flex-col h-full border-r border-surface-700">
  <!-- Header -->
  <div class="flex items-center justify-between px-4 py-2 border-b border-surface-700 bg-surface-900">
    <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Schema</span>
    {#if schemaStore.errors.length > 0}
      <span class="text-xs text-red-400">{schemaStore.errors.length} error{schemaStore.errors.length > 1 ? 's' : ''}</span>
    {:else if schemaStore.parsed}
      <span class="text-xs text-emerald-400">{schemaStore.parsed.models.length} models</span>
    {/if}
  </div>

  <!-- Editor: takes ~60% height -->
  <div class="flex-1 min-h-0">
    <Editor
      bind:value={schemaStore.text}
      language="text"
      onChange={handleSchemaChange}
    />
  </div>

  <!-- Model explorer -->
  {#if schemaStore.parsed && schemaStore.parsed.models.length > 0}
    <div class="border-t border-surface-700 bg-surface-900 max-h-48 overflow-y-auto">
      <div class="px-4 py-2">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Models</span>
      </div>
      {#each schemaStore.parsed.models as model}
        <div>
          <button
            onclick={() => toggleModel(model.name)}
            class="w-full flex items-center gap-1 px-4 py-1 hover:bg-surface-800 text-left text-sm text-gray-300"
          >
            <ChevronRight size={12} class={expanded.has(model.name) ? 'rotate-90' : ''} />
            {model.name}
          </button>
          {#if expanded.has(model.name)}
            <div class="pl-8 pb-1">
              {#each model.fields as field}
                <div class="text-xs text-gray-500 py-0.5">
                  <span class="text-gray-400">{field.name}</span>
                  <span class="text-purple-400"> {field.type}</span>
                  {#if field.isList}<span class="text-gray-600">[]</span>{/if}
                  {#if !field.isRequired}<span class="text-gray-600">?</span>{/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
