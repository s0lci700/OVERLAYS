<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import OverlayDice from './OverlayDice.svelte';

	const { Story } = defineMeta({
		title: 'Overlays/Moments/OverlayDice',
		component: OverlayDice,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen',
			backgrounds: { default: 'dark' },
			docs: {
				description: {
					component:
						'Animated dice roll result card. Pass preview with a rich diceResultEvent payload (rollType, advantage, target, outcome) or a legacy dice_rolled record to display without a server.'
				}
			}
		}
	});

	/** Rich diceResultEvent payload factory (contracts/events.ts → DiceResultEventPayload). */
	const rich = (overrides) => ({
		rollType: 'ability_check',
		diceType: 'd20',
		rolledDice: 14,
		selectedDie: 14,
		modifier: 2,
		advantage: 'normal',
		total: 16,
		criticalState: false,
		charId: 'CH101',
		characterName: 'Kael',
		source: 'stage',
		timestamp: new Date().toISOString(),
		...overrides
	});
</script>

<!-- Rich diceResultEvent payloads -->

<Story name="Ataque con Ventaja vs CA">
	<OverlayDice
		preview={rich({
			rollType: 'attack_roll',
			rolledDice: 17,
			selectedDie: 17,
			modifier: 5,
			advantage: 'advantage',
			total: 22,
			targetValue: 15,
			outcome: 'success'
		})}
	/>
</Story>

<Story name="Salvación Fallida con Desventaja">
	<OverlayDice
		preview={rich({
			rollType: 'saving_throw',
			characterName: 'Lyra',
			charId: 'CH102',
			rolledDice: 7,
			selectedDie: 7,
			modifier: 1,
			advantage: 'disadvantage',
			total: 8,
			targetValue: 14,
			outcome: 'failure'
		})}
	/>
</Story>

<Story name="Critico Rico (Nat 20)">
	<OverlayDice
		preview={rich({
			rollType: 'skill_check',
			characterName: 'Brum',
			charId: 'CH103',
			rolledDice: 20,
			selectedDie: 20,
			modifier: 3,
			total: 23,
			targetValue: 18,
			outcome: 'critical_success',
			criticalState: true
		})}
	/>
</Story>

<Story name="Iniciativa (sin objetivo)">
	<OverlayDice
		preview={rich({
			rollType: 'initiative_roll',
			characterName: 'Zara',
			charId: 'CH104',
			rolledDice: 12,
			selectedDie: 12,
			modifier: 4,
			total: 16
		})}
	/>
</Story>

<!-- Legacy dice_rolled payloads (server mirror / old clients) -->

<Story name="Critico Nat 20 (legacy)">
	<OverlayDice
		preview={{
			characterName: 'Kael',
			charId: 'CH101',
			result: 20,
			sides: 20,
			modifier: 3,
			rollResult: 23
		}}
	/>
</Story>

<Story name="Pifia Nat 1 (legacy)">
	<OverlayDice
		preview={{
			characterName: 'Lyra',
			charId: 'CH102',
			result: 1,
			sides: 20,
			modifier: 0,
			rollResult: 1
		}}
	/>
</Story>

<Story name="Normal d20 Roll (legacy)">
	<OverlayDice
		preview={{
			characterName: 'Brum',
			charId: 'CH103',
			result: 14,
			sides: 20,
			modifier: 2,
			rollResult: 16
		}}
	/>
</Story>

<Story name="d8 Damage Roll (legacy)">
	<OverlayDice
		preview={{
			characterName: 'Zara',
			charId: 'CH104',
			result: 6,
			sides: 8,
			modifier: 3,
			rollResult: 9
		}}
	/>
</Story>
