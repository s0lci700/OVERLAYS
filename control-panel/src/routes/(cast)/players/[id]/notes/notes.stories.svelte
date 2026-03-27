<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Page from './+page.svelte';
	import { thia, minimal } from '../__mocks__/characters';

	const { Story } = defineMeta({
		title: 'Cast/Players/Notes',
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
**Living Archive — NOTES tab**

Quest log placeholder, session chronicle (from \`character.notes\`), and a free-form
scratchpad persisted to \`localStorage['archive-scratch']\`.

### Scratchpad
- Persists on every \`input\` event — no save button needed
- Status indicator flashes \`●\` on change, returns to \`SAVED\` after 1s
- JetBrains Mono font reinforces the "field notes" register
- Amber corner dots: decorative only
					`
				}
			}
		}
	});
</script>

<script>
	import '../cast-layer.css';
</script>

<Story name="Thia — With Session Notes">
	<div style="background: #0d0d15; min-height: 100dvh; padding-top: 1rem;">
		<Page data={{ character: thia }} />
	</div>
</Story>

<Story name="Minimal — No Notes">
	<div style="background: #0d0d15; min-height: 100dvh; padding-top: 1rem;">
		<Page data={{ character: minimal }} />
	</div>
</Story>

<Story name="No Character (null state)">
	<div style="background: #0d0d15; min-height: 100dvh; padding-top: 1rem;">
		<Page data={{ character: null }} />
	</div>
</Story>
