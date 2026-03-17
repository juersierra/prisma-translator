<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  interface Props {
    value: string;
    language?: 'javascript' | 'typescript' | 'json' | 'text';
    readOnly?: boolean;
    onChange?: (value: string) => void;
    onCmdEnter?: () => void;
    class?: string;
  }

  let {
    value = $bindable(),
    language = 'javascript',
    readOnly = false,
    onChange,
    onCmdEnter,
    class: className = '',
  }: Props = $props();

  let container: HTMLDivElement;
  let view = $state<any>(undefined);

  onMount(() => {
    if (!browser) return;

    let editorView: any;

    (async () => {
      const [
        { EditorView, keymap: keymapFacet, drawSelection },
        { EditorState },
        { defaultKeymap, history, historyKeymap, indentWithTab },
        { oneDark },
      ] = await Promise.all([
        import('@codemirror/view'),
        import('@codemirror/state'),
        import('@codemirror/commands'),
        import('@codemirror/theme-one-dark'),
      ]);

      const keybindings: any[] = [
        ...defaultKeymap,
        ...historyKeymap,
        indentWithTab,
      ];
      if (onCmdEnter) {
        keybindings.push({ key: 'Mod-Enter', run: () => { onCmdEnter(); return true; } });
      }

      const extensions: any[] = [
        oneDark,
        history(),
        drawSelection(),
        EditorView.lineWrapping,
        keymapFacet.of(keybindings),
      ];

      if (language === 'javascript' || language === 'typescript') {
        const { javascript } = await import('@codemirror/lang-javascript');
        extensions.push(javascript({ typescript: language === 'typescript' }));
      } else if (language === 'json') {
        const { json } = await import('@codemirror/lang-json');
        extensions.push(json());
      }

      if (readOnly) {
        extensions.push(EditorState.readOnly.of(true));
      }

      extensions.push(
        EditorView.updateListener.of((update: any) => {
          if (update.docChanged && !readOnly) {
            const newValue = update.state.doc.toString();
            value = newValue;
            onChange?.(newValue);
          }
        })
      );

      editorView = new EditorView({
        state: EditorState.create({ doc: value, extensions }),
        parent: container,
      });

      view = editorView;
    })();

    return () => {
      editorView?.destroy();
      view = undefined;
    };
  });

  $effect(() => {
    if (view && view.state.doc.toString() !== value) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
    }
  });
</script>

<div bind:this={container} class="w-full h-full {className}"></div>

<style>
  div :global(.cm-editor) {
    height: 100%;
    font-size: 13px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
  }
  div :global(.cm-scroller) {
    overflow: auto;
    line-height: 1.7;
  }
</style>
