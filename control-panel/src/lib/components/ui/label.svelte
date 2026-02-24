<!--
  shadcn-svelte: Label component
  =================================
  Accessible form label that works with all input types.
-->
<script>
  import { cn } from "$lib/utils.js";

  let {
    class: className = "",
    for: htmlFor,
    children,
    ...restProps
  } = $props();
</script>

<label
  for={htmlFor}
  class={cn(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    className,
  )}
  {...restProps}
>
  {@render children?.()}
</label>
