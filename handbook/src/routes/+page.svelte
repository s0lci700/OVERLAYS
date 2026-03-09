<svelte:head>
	<title>Handbook — DADOS & RISAS</title>
	<meta name="description" content="Learning and reference handbook for the DADOS & RISAS production system." />
</svelte:head>

<main>
	<header>
		<h1>📖 DADOS &amp; RISAS Handbook</h1>
		<p class="subtitle">Learning &amp; reference guide for the production system</p>
	</header>

	<section class="cards">
		<div class="card">
			<h2>🎲 Project Overview</h2>
			<p>Architecture, stack decisions, and how the pieces fit together.</p>
		</div>
		<div class="card">
			<h2>🎨 Design System</h2>
			<p>Tokens, components, and visual language reference.</p>
		</div>
		<div class="card">
			<h2>⚙️ Backend &amp; API</h2>
			<p>Socket.io events, REST endpoints, and PocketBase data layer.</p>
		</div>
		<div class="card">
			<h2>🖥️ Overlays</h2>
			<p>OBS overlay routes, configuration, and animation patterns.</p>
		</div>
	</section>

	<footer>
		<p>Phase 1 — Scaffolding. Content coming soon.</p>
	</footer>
</main>

<style>
	:global(*, *::before, *::after) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(body) {
		font-family: system-ui, -apple-system, sans-serif;
		background: #0f0f0f;
		color: #e8e8e8;
		min-height: 100vh;
	}

	main {
		max-width: 960px;
		margin: 0 auto;
		padding: 3rem 1.5rem;
	}

	header {
		margin-bottom: 3rem;
		text-align: center;
	}

	h1 {
		font-size: 2.5rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		font-size: 1.1rem;
		color: #999;
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1.25rem;
		margin-bottom: 3rem;
	}

	.card {
		background: #1a1a1a;
		border: 1px solid #2a2a2a;
		border-radius: 10px;
		padding: 1.5rem;
	}

	.card h2 {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.card p {
		font-size: 0.875rem;
		color: #888;
		line-height: 1.5;
	}

	footer {
		text-align: center;
		font-size: 0.8rem;
		color: #555;
	}
</style>
