<!--
  MultiSelect
  ===========
  Custom multi-select listbox that toggles items on single click.
  Shows a ✓ checkmark on selected items instead of native blue highlight.

  Keyboard support (ARIA 1.2 multi-select listbox pattern):
  - Arrow Up/Down  — move focus between options
  - Home / End     — jump to first / last option
  - Enter / Space  — toggle selection on focused option
  - Type-to-jump   — focus the first option starting with typed character
-->
<script>
  import "./MultiSelect.css";

  function generateId() {
    try {
      if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
      ) {
        return crypto.randomUUID().slice(0, 8);
      }
    } catch (e) {}
    return Math.random().toString(36).slice(2, 10);
  }

  let {
    options = [],
    selected = [],
    onchange = () => {},
    disabled = false,
    size = 4,
    id = generateId(),
  } = $props();

  /** Index of the logically focused option (for aria-activedescendant). */
  let focusedIndex = $state(-1);

  function optionId(index) {
    return `ms-${id}-opt-${index}`;
  }

  function toggle(key) {
    if (disabled) return;
    const idx = selected.indexOf(key);
    if (idx >= 0) {
      onchange(selected.filter((k) => k !== key));
    } else {
      onchange([...selected, key]);
    }
  }

  function handleContainerKeydown(event) {
    if (disabled || options.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusedIndex = focusedIndex < options.length - 1 ? focusedIndex + 1 : 0;
        break;
      case "ArrowUp":
        event.preventDefault();
        focusedIndex = focusedIndex > 0 ? focusedIndex - 1 : options.length - 1;
        break;
      case "Home":
        event.preventDefault();
        focusedIndex = 0;
        break;
      case "End":
        event.preventDefault();
        focusedIndex = options.length - 1;
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (focusedIndex >= 0) toggle(options[focusedIndex].key);
        break;
      default:
        // Type-to-jump: focus first option whose label starts with the typed char.
        if (event.key.length === 1) {
          const char = event.key.toLowerCase();
          const match = options.findIndex((o) =>
            o.label.toLowerCase().startsWith(char),
          );
          if (match >= 0) focusedIndex = match;
        }
    }
  }

  function handleContainerFocus() {
    if (focusedIndex < 0 && options.length > 0) focusedIndex = 0;
  }

  function handleContainerBlur() {
    focusedIndex = -1;
  }

  function handleOptionKeydown(event, key, index) {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      focusedIndex = index;
      toggle(key);
    }
  }
</script>

<div
  class="multiselect selector"
  role="listbox"
  aria-multiselectable="true"
  aria-disabled={disabled}
  aria-activedescendant={focusedIndex >= 0 ? optionId(focusedIndex) : undefined}
  tabindex={disabled ? -1 : 0}
  style="--ms-rows: {size}"
  onkeydown={handleContainerKeydown}
  onfocus={handleContainerFocus}
  onblur={handleContainerBlur}
>
  {#if options.length === 0}
    <div class="ms-empty">Sin opciones</div>
  {:else}
    {#each options as option, i (option.key)}
      {@const isSelected = selected.includes(option.key)}
      {@const isFocused = focusedIndex === i}
      <div
        id={optionId(i)}
        class="ms-option"
        class:ms-selected={isSelected}
        class:ms-focused={isFocused}
        role="option"
        aria-selected={isSelected}
        tabindex={disabled ? -1 : isFocused ? 0 : -1}
        onkeydown={(e) => handleOptionKeydown(e, option.key, i)}
        onclick={() => {
          focusedIndex = i;
          toggle(option.key);
        }}
      >
        <span class="ms-label">{option.label}</span>
        {#if isSelected}
          <span class="ms-check" aria-hidden="true">✓</span>
        {/if}
      </div>
    {/each}
  {/if}
</div>
