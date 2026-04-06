<script lang="ts">
  import type { Meta, StoryObj } from '@storybook/svelte';
  import AlchemicalIcon from './AlchemicalIcon.svelte';

  const meta = {
    title: 'Shared/AlchemicalIcon',
    component: AlchemicalIcon,
    tags: ['autodocs'],
    argTypes: {
      size: {
        control: { type: 'select' },
        options: ['sm', 'md', 'lg'],
      },
    },
  } satisfies Meta<AlchemicalIcon>;

  export default meta;
  type Story = StoryObj<typeof meta>;
</script>

<Story name="Mock Library Icon">
  <div class="flex gap-8 p-8 bg-amber-50">
    <AlchemicalIcon 
      condition={{ id: '1', condition_name: 'Poisoned', intensity_level: 1, applied_at: '' }} 
      size="md" 
      showLabel 
    />
    <AlchemicalIcon 
      condition={{ id: '2', condition_name: 'Stunned', intensity_level: 1, applied_at: '' }} 
      size="md" 
      showLabel 
    />
  </div>
</Story>

<Story name="Intensity Levels">
  <div class="flex gap-8 p-8 bg-amber-50">
    <AlchemicalIcon 
      condition={{ id: '3', condition_name: 'Poisoned', intensity_level: 2, applied_at: '' }} 
      size="md" 
    />
    <AlchemicalIcon 
      condition={{ id: '4', condition_name: 'Poisoned', intensity_level: 5, applied_at: '' }} 
      size="md" 
    />
  </div>
</Story>

<Story name="Custom Asset (Imagen)">
  <div class="flex gap-8 p-8 bg-amber-50">
    <AlchemicalIcon 
      condition={{ 
        id: '5', 
        condition_name: 'Arcane Burn', 
        intensity_level: 1, 
        applied_at: '',
        asset: {
          id: 'a1',
          condition_name: 'Arcane Burn',
          image_url: 'https://placehold.co/400x400/000000/FFF?text=Sketch',
          is_generated: true
        }
      }} 
      size="lg" 
      showLabel 
    />
  </div>
</Story>

<Story name="Fallback Placeholder">
  <div class="flex gap-8 p-8 bg-amber-50">
    <AlchemicalIcon 
      condition={{ id: '6', condition_name: 'Exhaustion', intensity_level: 1, applied_at: '' }} 
      size="md" 
      showLabel 
    />
  </div>
</Story>

<Story name="Sizes">
  <div class="flex items-end gap-8 p-8 bg-amber-50">
    <AlchemicalIcon 
      condition={{ id: '7', condition_name: 'Stunned', intensity_level: 1, applied_at: '' }} 
      size="sm" 
      showLabel 
    />
    <AlchemicalIcon 
      condition={{ id: '8', condition_name: 'Stunned', intensity_level: 1, applied_at: '' }} 
      size="md" 
      showLabel 
    />
    <AlchemicalIcon 
      condition={{ id: '9', condition_name: 'Stunned', intensity_level: 1, applied_at: '' }} 
      size="lg" 
      showLabel 
    />
  </div>
</Story>
