<script>
	import { Separator } from "$lib/components/shared/separator/index.js";
	import { cn } from "$lib/services/utils.js";
	let {
		ref = $bindable(null),
		class: className,
		...restProps
	} = $props();
</script>

<Separator
	bind:ref
	data-slot="sidebar-separator"
	data-sidebar="separator"
	class={cn("bg-sidebar-border", className)}
	{...restProps}
/>