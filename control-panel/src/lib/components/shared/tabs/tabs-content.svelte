<script>
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "$lib/services/utils.js";

	let {
		ref = $bindable(null),
		class: className = "",
		value,
		...restProps
	} = $props();
</script>

<TabsPrimitive.Content
	bind:ref
	{value}
	data-slot="tabs-content"
	class={cn("flex-1 outline-none", className)}
	{...restProps}
/>