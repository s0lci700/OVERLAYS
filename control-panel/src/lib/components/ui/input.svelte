<!--
  shadcn-svelte: Input component
  =================================
  Styled text input that matches the shadcn design system.
-->
<script>
  import { cn } from "$lib/utils.js";

  let {
    class: className = "",
    type = "text",
    disabled = false,
    placeholder = "",
    value = $bindable(""),
    ...restProps
  } = $props();
</script>

<input
  {type}
  {disabled}
  {placeholder}
  bind:value
  class={cn(
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    className,
  )}
  {...restProps}
/>
