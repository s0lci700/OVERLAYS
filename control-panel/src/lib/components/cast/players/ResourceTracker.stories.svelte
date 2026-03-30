<script context="module" lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ResourceTracker from './ResourceTracker.svelte';

  const { Story } = defineMeta({
    title: 'Cast/Players/ResourceTracker',
    component: ResourceTracker,
    parameters: {
      layout: 'padded',
      backgrounds: { default: 'dark' }
    }
  });
</script>
<script lang="ts">
  // Base mock that conforms to CharacterRecord shape for resources
  const baseMock = {
    id: 'char1',
    name: 'Test Character',
    resources: []
  } as unknown as CharacterRecord;
  
  import type { CharacterRecord } from '$lib/contracts/records';

  const noResources = { ...baseMock, resources: [] } as unknown as CharacterRecord;
  
  const standardResources = {
    ...baseMock,
    resources: [
      { id: '1', name: 'Action Surge', pool_current: 1, pool_max: 1, reset_on: 'short_rest' },
      { id: '2', name: 'Second Wind', pool_current: 0, pool_max: 1, reset_on: 'short_rest' },
      { id: '3', name: 'Hit Dice', pool_current: 3, pool_max: 5, reset_on: 'long_rest' }
    ]
  } as unknown as CharacterRecord;
  
  const mixedResources = {
    ...baseMock,
    resources: [
      { id: '1', name: 'Channel Divinity', pool_current: 1, pool_max: 2, reset_on: 'short_rest' },
      { id: '2', name: 'Slots Nv.1', pool_current: 4, pool_max: 4, reset_on: 'long_rest' },
      { id: '3', name: 'Slots Nv.2', pool_current: 1, pool_max: 3, reset_on: 'long_rest' },
      { id: '4', name: 'Level 3 Spell Slots', pool_current: 0, pool_max: 2, reset_on: 'long_rest' }
    ]
  } as unknown as CharacterRecord;
  
  const depletedResources = {
    ...baseMock,
    resources: [
      { id: '1', name: 'Channel Divinity', pool_current: 0, pool_max: 2, reset_on: 'short_rest' },
      { id: '2', name: 'Slots Nv.1', pool_current: 0, pool_max: 4, reset_on: 'long_rest' },
      { id: '3', name: 'Slots Nv.2', pool_current: 0, pool_max: 3, reset_on: 'long_rest' }
    ]
  } as unknown as CharacterRecord;


</script>
<!-- Wrap stories in the dark cast canvas background for context -->
<div style="background-color: #0d0d15; padding: 2rem; max-width: 500px; min-height: 100vh;">
  <Story name="Standard Resources" args={{ character: standardResources }} />
</div>

<div style="background-color: #0d0d15; padding: 2rem; max-width: 500px; min-height: 100vh;">
  <Story name="Mixed (With Spell Slots)" args={{ character: mixedResources }} />
</div>

<div style="background-color: #0d0d15; padding: 2rem; max-width: 500px; min-height: 100vh;">
  <Story name="Depleted State" args={{ character: depletedResources }} />
</div>

<div style="background-color: #0d0d15; padding: 2rem; max-width: 500px; min-height: 100vh;">
  <Story name="Empty Resources" args={{ character: noResources }} />
</div>
