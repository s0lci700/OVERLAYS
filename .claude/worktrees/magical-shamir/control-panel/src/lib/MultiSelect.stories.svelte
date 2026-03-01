<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MultiSelect from "./MultiSelect.svelte";

  const conditionOptions = [
    { value: "envenenado", label: "Envenenado" },
    { value: "aturdido", label: "Aturdido" },
    { value: "asustado", label: "Asustado" },
    { value: "encantado", label: "Encantado" },
    { value: "cegado", label: "Cegado" },
    { value: "paralizado", label: "Paralizado" },
    { value: "inconsciente", label: "Inconsciente" },
    { value: "concentracion", label: "Concentración" },
  ];

  const { Story } = defineMeta({
    title: "Components/MultiSelect",
    component: MultiSelect,
    tags: ["autodocs"],
    argTypes: {
      disabled: { control: "boolean" },
      size: { control: { type: "number", min: 2, max: 10 } },
    },
  });
</script>

<Story name="Empty" args={{ options: conditionOptions, selected: [], size: 5 }} />

<Story name="Preselected" args={{ options: conditionOptions, selected: ["envenenado", "aturdido"], size: 5 }} />

<Story name="All Selected" args={{ options: conditionOptions, selected: ["envenenado", "aturdido", "asustado", "encantado"], size: 5 }} />

<Story name="Disabled" args={{ options: conditionOptions, selected: ["encantado"], disabled: true, size: 5 }} />

<Story name="D&D Conditions Full">
  <div style="padding: 16px; max-width: 320px;">
    <label style="display: block; margin-bottom: 8px; font-size: 0.75rem; letter-spacing: 0.1em;">
      CONDICIONES ACTIVAS
    </label>
    <MultiSelect
      options={conditionOptions}
      selected={["asustado", "envenenado"]}
      size={6}
      onchange={() => {}}
    />
  </div>
</Story>
