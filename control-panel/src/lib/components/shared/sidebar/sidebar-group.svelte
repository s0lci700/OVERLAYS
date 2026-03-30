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
	data-slot="sidebar-group"
	data-sidebar="group"
	class={cn("relative flex w-full min-w-0 flex-col p-2", className)}
	{...restProps}
>
	{@render children?.()}
</div>