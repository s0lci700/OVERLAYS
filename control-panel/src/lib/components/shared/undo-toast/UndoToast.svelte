<!--
  UndoToast
  =========
  Inline feedback toast for reversible actions (HP mutations, bulk changes, etc.).
  Renders a label and a single "DESHACER" button. Auto-dismissed by the parent
  via conditional rendering with a timeout — this component does not own the timer.

  Usage:
    {#if toast}
      <UndoToast label={toast.label} onUndo={handleUndo} />
    {/if}
-->
<script lang="ts">
  import './undo-toast.css';
  import { fade } from 'svelte/transition';

  let {
    label,
    onUndo,
  }: {
    label: string;
    onUndo: () => void;
  } = $props();
</script>

<div class="undo-toast" transition:fade={{ duration: 150 }}>
  <span class="undo-toast__label">{label}</span>
  <button class="undo-toast__btn" onclick={onUndo}>DESHACER</button>
</div>
