<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Page from './+page.svelte';
	import { thia, thiaCritical, grimtar, minimal } from './__mocks__/characters';

	const { Story } = defineMeta({
		title: 'Cast/Players/Home',
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
**Living Archive — HOME tab**

Tactical overview for a player character. Shows the stat strip (AC, Speed, Initiative, Prof Bonus),
the 6-ability score grid with computed modifiers, tracked resources, and signature proficient skills.

### Design System
- \`--cast-amber\` (#C8944A) — structural chrome: labels, section dividers, left rails
- \`--cast-cyan\` (#00E5FF) — live state ONLY: HP/AC display in the layout header
- HP critical (≤25%) triggers breathing animation on the header HP display

### States tested
| Story | Scenario |
|-------|----------|
| Thia — Healthy | Full spell slots, no conditions |
| Thia — Critical HP | 12/64 HP, two conditions, depleted slots |
| Grimtar — Fighter | No expertise, all resources, BLESSED condition |
| Minimal — No Resources | Level 1, no resources, no conditions |
					`
				}
			}
		}
	});
</script>

<script>
	import './cast-layer.css';
</script>

<Story name="Thia — Healthy (LVL 12 Wizard)">
	<div style="background: #0d0d15; min-height: 100dvh; padding-top: 1rem;">
		<Page data={{ character: thia }} />
	</div>
</Story>

<Story name="Thia — Critical HP (19%)">
	<div style="background: #0d0d15; min-height: 100dvh; padding-top: 1rem;">
		<Page data={{ character: thiaCritical }} />
	</div>
</Story>

<Story name="Grimtar — Fighter (Full Health)">
	<div style="background: #0d0d15; min-height: 100dvh; padding-top: 1rem;">
		<Page data={{ character: grimtar }} />
	</div>
</Story>

<Story name="Minimal — No Resources">
	<div style="background: #0d0d15; min-height: 100dvh; padding-top: 1rem;">
		<Page data={{ character: minimal }} />
	</div>
</Story>

<Story name="No Character (null state)">
	<div style="background: #0d0d15; min-height: 100dvh; padding-top: 1rem;">
		<Page data={{ character: null }} />
	</div>
</Story>
