<script>
  /**
   * Wrapper for DiceRoller stories that pre-populates the lastRoll store.
   * Used only in Storybook to preview the result display states.
   */
  import { onMount } from "svelte";
  import DiceRoller from "./DiceRoller.svelte";
  import { lastRoll } from "$lib/services/socket.svelte.js";

  let { result, sides, modifier, rollResult, charId, characterName } = $props();

  onMount(() => {
    lastRoll.set({ result, sides, modifier, rollResult, charId, characterName });
  });
</script>

<DiceRoller />
