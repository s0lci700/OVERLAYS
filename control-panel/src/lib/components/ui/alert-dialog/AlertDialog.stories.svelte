<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import AlertContent from "$lib/components/ui/alert-dialog/alert-dialog-content.svelte";
  import { Button } from "$lib/components/ui/button/index.js";

  const { Story } = defineMeta({
    title: "Components/AlertDialog",
    component: AlertContent,
    tags: ["autodocs"],
  });
</script>

<Story name="Delete Confirm">
  <div style="padding:24px;">
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <Button class="btn-base">Delete character</Button>
      </AlertDialog.Trigger>

      <AlertDialog.Content class="card-base delete-confirm-dialog">
        <AlertDialog.Title class="delete-confirm-title"
          >Eliminar personaje</AlertDialog.Title
        >
        <AlertDialog.Description class="delete-confirm-desc">
          Esta acción eliminará permanentemente al personaje seleccionado.
          ¿Estás seguro?
        </AlertDialog.Description>

        <div
          style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;"
        >
          <AlertDialog.Cancel asChild>
            <Button class="btn-base">Cancelar</Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <Button class="btn-destructive">Eliminar</Button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Root>
  </div>
</Story>
