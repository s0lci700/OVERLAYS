<script>
	import { cn } from "$lib/services/utils.js";
	/** @type {{ ref?: any, class?: any, children?: import('svelte').Snippet, [key: string]: any }} */
	let {
		ref = $bindable(null),
		class: className = undefined,
		children,
		...restProps
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="sidebar-group-content"
	data-sidebar="group-content"
	class={cn("w-full text-sm", className)}
	{...restProps}
>
	{@render children?.()}
</div>