<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Utilities/AssetsGallery",
    tags: ["autodocs"],
  });
</script>

<script>
  // List of images present in the repo assets/img folder
  // Update this list if you add/remove images there.
  export let images = [
    "/assets/img/barbarian.png",
    "/assets/img/dwarf.png",
    "/assets/img/elf.png",
    "/assets/img/thiefling.png",
    "/assets/img/wizard.png",
  ];
  //   import { barbarian, dwarf, elf, thiefling, wizard } from "$lib/assets/index.js";
</script>

<Story name="Default" let:args>
  <div
    style="padding:16px;display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start;"
  >
    {#each images as src}
      <figure style="width:160px;text-align:center;margin:0;">
        <img
          {src}
          alt={src}
          style="width:100%;height:auto;border-radius:8px;border:1px solid #eee;"
        />
        <figcaption
          style="font-size:12px;margin-top:6px;color:#444;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
        >
          {src}
        </figcaption>
      </figure>
    {/each}
  </div>
</Story>
