<script lang="ts">
  const title = "Dados & Risas — Learning Handbook";
  const description =
    "The project reference handbook for the Dados & Risas D&D streaming system. Covers architecture, Socket.io events, design tokens, overlays, and onboarding.";
</script>

<main>
  <header>
    <h1>📖 {title}</h1>
    <p class="tagline">{description}</p>
  </header>

  <section class="sections">
    <article>
      <h2>🏗 Architecture</h2>
      <p>How the backend, control panel, PocketBase, and OBS overlays fit together.</p>
    </article>

    <article>
      <h2>🎲 Socket Events</h2>
      <p>Complete reference for all Socket.io event payloads and data shapes.</p>
    </article>

    <article>
      <h2>🎨 Design System</h2>
      <p>CSS tokens, component states, animation timing, and brand guidelines.</p>
    </article>

    <article>
      <h2>🗃 Data Layer</h2>
      <p>PocketBase collections, character structure, roll history, and seed data.</p>
    </article>

    <article>
      <h2>🚀 Deployment</h2>
      <p>Environment setup, Railway config, OBS browser source URLs, and LAN IP setup.</p>
    </article>

    <article>
      <h2>🧭 Onboarding</h2>
      <p>Getting started guide for new contributors.</p>
    </article>
  </section>

  <footer>
    <p>Phase 1 — content coming soon.</p>
  </footer>
</main>

<style>
  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, sans-serif;
    background: #0f0f0f;
    color: #e8e8e8;
    line-height: 1.6;
  }

  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  header {
    text-align: center;
    padding: 3rem 0 2rem;
    border-bottom: 1px solid #2a2a2a;
    margin-bottom: 2.5rem;
  }

  h1 {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 700;
    margin: 0 0 0.75rem;
    color: #ffffff;
  }

  .tagline {
    color: #999;
    max-width: 600px;
    margin: 0 auto;
    font-size: 1rem;
  }

  .sections {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.25rem;
  }

  article {
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    padding: 1.5rem;
    transition: border-color 0.2s;
  }

  article:hover {
    border-color: #ff4d6a;
  }

  h2 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
    color: #ffffff;
  }

  article p {
    margin: 0;
    font-size: 0.9rem;
    color: #888;
  }

  footer {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid #2a2a2a;
    text-align: center;
    color: #555;
    font-size: 0.875rem;
  }
</style>
