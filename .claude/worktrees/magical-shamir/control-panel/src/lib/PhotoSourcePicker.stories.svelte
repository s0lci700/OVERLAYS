<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PhotoSourcePicker from "$lib/PhotoSourcePicker.svelte";

  const demoOptions = [
    { label: "Avatar 1", value: "/img/avatar1.png" },
    { label: "Avatar 2", value: "/img/avatar2.png" },
    { label: "Random", value: "" },
  ];

  const { Story } = defineMeta({
    title: "Components/PhotoSourcePicker",
    component: PhotoSourcePicker,
    tags: ["autodocs"],
    args: {
      title: "Foto del personaje",
      options: demoOptions,
      source: "preset",
      presetValue: demoOptions[0].value,
      urlValue: "",
      localValue: "",
      serverUrl: "http://localhost:3000",
      dense: false,
    },
  });
</script>

<Story name="Default" let:args>
  <div style="padding:20px;max-width:720px;">
    <PhotoSourcePicker {...args} />
  </div>
</Story>
