<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Page from './+page.svelte';
	import { thia, grimtar, minimal } from '../__mocks__/characters';

	const { Story } = defineMeta({
		title: 'Cast/Players/Skills',
		component: Page,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen',
			viewport: { defaultViewport: 'mobile1' },
			backgrounds: {
				default: 'grimoire',
				values: [{ name: 'grimoire', value: '#0d0d15' }]
			},
			docs: {
				description: {
					component: `
**Living Archive — SKILLS tab**

Dense ledger of all 18 D&D 5e skills. Default view shows proficient + expertise skills only;
a toggle reveals the full list. Live search filters by name; stat chips filter by ability score.

### Proficiency indicators (shape-based)
- Hollow triangle — non-proficient
- Solid amber triangle — proficient
- Two solid amber triangles — expertise (score shown in \`--cast-amber-pale\`)

### Interactions
- Search input: real-time filtering, auto-expands non-proficient when active
- Stat chips: ALL / STR / DEX / CON / INT / WIS / CHA
- Show more / collapse toggle
					`
				}
			}
		}
	});
</script>

<script>
	import '../cast-layer.css';
</script>

<Story name="Thia — Wizard (Expertise in Arcana + History)">
	<div style="background: #0d0d15; min-height: 100dvh; padding-top: 1rem;">
		<Page data={{ character: thia }} />
	</div>
</Story>

<Story name="Grimtar — Fighter (Athletics + Perception + Intimidation)">
	<div style="background: #0d0d15; min-height: 100dvh; padding-top: 1rem;">
		<Page data={{ character: grimtar }} />
	</div>
</Story>

<Story name="Minimal — 2 Skills Only">
	<div style="background: #0d0d15; min-height: 100dvh; padding-top: 1rem;">
		<Page data={{ character: minimal }} />
	</div>
</Story>

<Story name="No Character (null state)">
	<div style="background: #0d0d15; min-height: 100dvh; padding-top: 1rem;">
		<Page data={{ character: null }} />
	</div>
</Story>
