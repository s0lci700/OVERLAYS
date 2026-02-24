<!--
  shadcn-svelte: Card components
  =================================
  Composable card family: Card, CardHeader, CardTitle,
  CardDescription, CardContent, CardFooter.
-->
<script>
  import { cn } from "$lib/utils.js";

  let { class: className = "", children, ...restProps } = $props();
</script>

<div
  class={cn(
    "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
    className,
  )}
  {...restProps}
>
  {@render children?.()}
</div>
