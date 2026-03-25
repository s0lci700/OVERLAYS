<script>
	import { Input } from "$lib/components/shared/input/index.js";
	import { cn } from "$lib/services/utils.js";

	let {
		ref = $bindable(null),
		value = $bindable(""),
		class: className,
		...restProps
	} = $props();
</script>

<Input
	bind:ref
	bind:value
	data-slot="sidebar-input"
	data-sidebar="input"
	class={cn("bg-background h-8 w-full shadow-none", className)}
	{...restProps}
/>