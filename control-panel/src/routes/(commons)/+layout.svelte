<!--
  Commons layout — shared room display shell (wallboard on a TV).
  Passive surface: no controls, no write authority. Dark fullscreen canvas
  under the app header; content is sized for across-the-room readability.
-->
<script lang="ts">
	let { children } = $props();
</script>

<div class="commons-shell">
	{@render children()}
</div>

<style>
	.commons-shell {
		min-height: calc(100dvh - 64px);
		background: var(--black);
		overflow-x: hidden;
	}
</style>
