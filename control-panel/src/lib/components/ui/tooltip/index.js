import { Tooltip as TooltipPrimitive } from "bits-ui";

const Root = TooltipPrimitive.Root;
const Trigger = TooltipPrimitive.Trigger;
const Provider = TooltipPrimitive.Provider;

import Content from "./tooltip-content.svelte";

export {
	Root,
	Trigger,
	Provider,
	Content,
	Root as Tooltip,
	Trigger as TooltipTrigger,
	Provider as TooltipProvider,
	Content as TooltipContent,
};
