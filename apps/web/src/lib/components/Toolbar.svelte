<script lang="ts">
  import { Database } from 'lucide-svelte';
</script>

<header class="flex items-center justify-between px-6 h-12 border-b border-surface-700 bg-surface-900 shrink-0">
  <div class="flex items-center gap-2">
    <Database size={18} class="text-violet-400" />
    <span class="font-semibold text-gray-100 tracking-tight">Prisma Translator</span>
    <span class="text-xs text-gray-600 ml-2">paste schema + query → see types</span>
  </div>
  <div class="flex items-center gap-3">
    <span class="text-xs text-gray-600">Phase 1 — MVP</span>
  </div>
</header>
