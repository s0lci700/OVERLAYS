<script>
	import { cn } from "$lib/services/utils.js";
	/** @type {{ ref?: any, class?: string, children?: import('svelte').Snippet, [key: string]: any }} */
	let {
		ref = $bindable(null),
		class: className = undefined,
		children,
		...restProps
	} = $props();
</script>

<li
	bind:this={ref}
	data-slot="sidebar-menu-item"
	data-sidebar="menu-item"
	class={cn("group/menu-item relative", className)}
	{...restProps}
>
	{@render children?.()}
</li>