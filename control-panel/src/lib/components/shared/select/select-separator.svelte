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
	data-slot="select-separator"
	class={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
	{...restProps}
/>