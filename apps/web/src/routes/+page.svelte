<script lang="ts">
  import Toolbar from '$lib/components/Toolbar.svelte';
  import SchemaPanel from '$lib/components/SchemaPanel.svelte';
  import QueryPanel from '$lib/components/QueryPanel.svelte';
  import OutputPanel from '$lib/components/OutputPanel.svelte';
</script>

<div class="h-screen flex flex-col overflow-hidden">
  <Toolbar />
  <main class="flex flex-1 min-h-0 overflow-hidden divide-x divide-surface-700">
    <div class="w-1/3 min-w-0 flex flex-col">
      <SchemaPanel />
    </div>
    <div class="w-1/3 min-w-0 flex flex-col">
      <QueryPanel />
    </div>
    <div class="w-1/3 min-w-0 flex flex-col">
      <OutputPanel />
    </div>
  </main>
</div>
