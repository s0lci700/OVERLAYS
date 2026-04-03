<script lang="ts">
  import type { CharacterRecord, ResourceSlot } from '$lib/contracts/records';

  let {
    character,
    readonly = true
  }: {
    character: CharacterRecord;
    readonly?: boolean;
  } = $props();
</script>