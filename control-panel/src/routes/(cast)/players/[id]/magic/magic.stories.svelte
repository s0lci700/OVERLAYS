<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Page from './+page.svelte';
	import { thia, grimtar } from '../__mocks__/characters';

	const { Story } = defineMeta({
		title: 'Cast/Players/Magic',
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
**Living Archive — MAGIC tab** *(Phase 2 placeholder)*

Spellbook and spell slot tracker. Spell data is not yet part of \`CharacterRecord\` —
this tab will be implemented in Phase 2 when the spell schema is finalized.

### Design intent
- Left rail: lavender (\`--cast-lavender\`) for magic-specific chrome
- Spell slots: geometric clip-path shapes (triangle L1, diamond L2, hexagon L3)
- Available slots: amber glow + breathing animation
- Depleted slots: hollow border only
					`
				}
			}
		}
	});
</script>

<script>
	import '../cast-layer.css';
</script>

<Story name="Thia — Wizard">
	<div style="background: #0d0d15; min-height: 100dvh; padding-top: 1rem;">
		<Page data={{ character: thia }} />
	</div>
</Story>

<Story name="Grimtar — Fighter (No Spells)">
	<div style="background: #0d0d15; min-height: 100dvh; padding-top: 1rem;">
		<Page data={{ character: grimtar }} />
	</div>
</Story>
