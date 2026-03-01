import { AlertDialog as AlertDialogPrimitive } from "bits-ui";

// Re-export primitive parts that need no custom styling
const Root = AlertDialogPrimitive.Root;
const Trigger = AlertDialogPrimitive.Trigger;
const Action = AlertDialogPrimitive.Action;
const Cancel = AlertDialogPrimitive.Cancel;
const Title = AlertDialogPrimitive.Title;
const Description = AlertDialogPrimitive.Description;

// Styled wrapper components
import Content from "./alert-dialog-content.svelte";
import Overlay from "./alert-dialog-overlay.svelte";

export {
	Root,
	Trigger,
	Content,
	Overlay,
	Action,
	Cancel,
	Title,
	Description,
	Root as AlertDialog,
	Trigger as AlertDialogTrigger,
	Content as AlertDialogContent,
	Overlay as AlertDialogOverlay,
	Action as AlertDialogAction,
	Cancel as AlertDialogCancel,
	Title as AlertDialogTitle,
	Description as AlertDialogDescription,
};
