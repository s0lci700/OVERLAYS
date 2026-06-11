<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SessionImport from './SessionImport.svelte';

	const { Story } = defineMeta({
		title: 'Stage/SessionImport',
		component: SessionImport,
		tags: ['autodocs'],
		parameters: {
			backgrounds: { default: 'dark' },
			docs: {
				description: {
					component:
						'File picker for session.json packages from the Prep App. Pass preview (SessionPackage) to render the loaded state without touching the stage store.'
				}
			}
		}
	});

	/** @type {import('$lib/contracts').SessionPackage} */
	const mockPackage = {
		session: {
			title: 'La Tormenta de Santa Añañuca',
			session_number: 3,
			campaign: 'Dados & Risas'
		},
		locations: [
			{ name: 'Pampa del Indio Muerto' },
			{ name: 'Cueva del Talismán', description: 'Entrada colapsada al sur' }
		],
		npcs: [{ name: 'Doña Carmela', role: 'curandera' }],
		enemies: [{ name: 'Culebrón', role: 'jefe' }, { name: 'Bandido calichero' }],
		storyBeats: [
			{ title: 'Llegada al pueblo' },
			{ title: 'El derrumbe' },
			{ title: 'Revelación del talismán' }
		]
	};
</script>

<Story name="Sin sesión (vacío)">
	<SessionImport />
</Story>

<Story name="Sesión cargada">
	<SessionImport preview={mockPackage} />
</Story>
