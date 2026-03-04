<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import OverlayAnnounce from "./announcements/OverlayAnnounce.svelte";

  const { Story } = defineMeta({
    title: "Overlays/Announcements/OverlayAnnounce",
    component: OverlayAnnounce,
    tags: ["autodocs"],
    parameters: {
      layout: "fullscreen",
      backgrounds: { default: "dark" },
      docs: {
        description: {
          component:
            "Generic announcement modal. Types: location, knowledge (typewriter), npc, custom. Pass preview to display without a server.",
        },
      },
    },
  });
</script>

<Story name="Location Announcement">
  <OverlayAnnounce preview={{ type: "location", title: "La Ciudad de Ironhaven", body: "Un puerto bullicioso en la desembocadura del río Grisal." }} />
</Story>

<Story name="Knowledge Drop">
  <OverlayAnnounce preview={{ type: "knowledge", title: "Lore Descubierto", body: "Los dragones de hielo hibernan durante cien años antes de despertar con hambre." }} />
</Story>

<Story name="NPC Introduction">
  <OverlayAnnounce preview={{ type: "npc", title: "Marisela, la Tabernera", body: "Una enana corpulenta con ojos que han visto demasiado." }} />
</Story>

<Story name="Custom Alert">
  <OverlayAnnounce preview={{ type: "custom", title: "¡Atención!", body: "El servidor se reinicia en 5 minutos." }} />
</Story>
