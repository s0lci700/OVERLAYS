<script>
	import { Accordion as AccordionPrimitive } from "bits-ui";

	/** @type {{ ref?: any, value?: any, type?: "single" | "multiple", [key: string]: any }} */
	let {
		ref = $bindable(null),
		value = $bindable(),
		type = "single",
		...restProps
	} = $props();
</script>

<AccordionPrimitive.Root
	bind:ref
	bind:value={value}
	{type}
	data-slot="accordion"
	{...restProps}
/>