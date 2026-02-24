<!--
  shadcn-svelte: Separator component
  =====================================
  Horizontal or vertical divider line.
-->
<script>
  import { cn } from "$lib/utils.js";

  let {
    class: className = "",
    /** @type {'horizontal' | 'vertical'} */
    orientation = "horizontal",
    decorative = true,
    ...restProps
  } = $props();
</script>

<div
  role={decorative ? "none" : "separator"}
  aria-orientation={decorative ? undefined : orientation}
  class={cn(
    "shrink-0 bg-border",
    orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
    className,
  )}
  {...restProps}
></div>
