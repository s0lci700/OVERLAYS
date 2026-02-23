<!--
  MultiSelect
  ===========
  Custom multi-select listbox that toggles items on single click.
  Shows a ✓ checkmark on selected items instead of native blue highlight.
-->
<script>
  import "./MultiSelect.css";

  let {
    options = [],
    selected = [],
    onchange = () => {},
    disabled = false,
    size = 4,
  } = $props();

  function toggle(key) {
    if (disabled) return;
    const idx = selected.indexOf(key);
    if (idx >= 0) {
      onchange(selected.filter((k) => k !== key));
    } else {
      onchange([...selected, key]);
    }
  }

  function handleKeydown(event, key) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle(key);
    }
  }
</script>

<div
  class="multiselect selector"
  role="listbox"
  aria-multiselectable="true"
  aria-disabled={disabled}
  style="--ms-rows: {size}"
>
  {#if options.length === 0}
    <div class="ms-empty">Sin opciones</div>
  {:else}
    {#each options as option (option.key)}
      {@const isSelected = selected.includes(option.key)}
      <button
        type="button"
        class="ms-option"
        class:ms-selected={isSelected}
        role="option"
        aria-selected={isSelected}
        {disabled}
        onclick={() => toggle(option.key)}
        onkeydown={(e) => handleKeydown(e, option.key)}
      >
        <span class="ms-label">{option.label}</span>
        {#if isSelected}
          <span class="ms-check" aria-hidden="true">✓</span>
        {/if}
      </button>
    {/each}
  {/if}
</div>
