<!--
  shadcn-svelte: Badge component
  ================================
  Small status indicator with semantic variants.
  Variants: default | secondary | destructive | outline
-->
<script>
  import { cn } from "$lib/utils.js";

  let {
    /** @type {'default' | 'secondary' | 'destructive' | 'outline'} */
    variant = "default",
    class: className = "",
    children,
    ...restProps
  } = $props();

  const base =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  const variants = {
    default:
      "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary:
      "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive:
      "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  };
</script>

<div class={cn(base, variants[variant], className)} {...restProps}>
  {@render children?.()}
</div>
