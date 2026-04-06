<!--
  DieSpinner
  ==========
  Looping die-shape morphing animation via GSAP MorphSVG.
  d4 → d6 → d8 → d10 → d12 → d20 → d4, continuously.

  Usage:
    <DieSpinner />
    <DieSpinner size={48} color="var(--cast-amber)" speed={0.5} />
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

  gsap.registerPlugin(MorphSVGPlugin);

  let {
    size = 32,
    color = 'currentColor',
    speed = 0.55, // seconds per morph
  }: {
    size?: number;
    color?: string;
    speed?: number;
  } = $props();

  // Paths share the same viewBox (0 0 512 512).
  // MorphSVG redistributes vertices automatically across different counts.
  const SHAPES: string[] = [
    'M256,48 L48,400 L464,400 Z',                                                                    // d4
    'M256,80 L436,184 L436,392 L256,496 L76,392 L76,184 Z',                                         // d6
    'M256,48 L464,256 L256,464 L48,256 Z',                                                           // d8
    'M256,32 L464,224 L256,480 L48,224 Z',                                                           // d10
    'M256,32 L388,75 L469,187 L469,325 L388,437 L256,480 L124,437 L43,325 L43,187 L124,75 Z',       // d12
    'M256,32 L448,144 L448,368 L256,480 L64,368 L64,144 Z',                                         // d20
  ];

  let pathEl = $state<SVGPathElement | null>(null);

  onMount(() => {
    if (!pathEl) return;

    pathEl.setAttribute('d', SHAPES[0]);

    const tl = gsap.timeline({ repeat: -1 });

    // Cycle forward through all shapes then back to d4
    [...SHAPES.slice(1), SHAPES[0]].forEach((shape) => {
      tl.to(pathEl, {
        morphSVG: shape,
        duration: speed,
        ease: 'sine.inOut',
      });
    });

    return () => tl.kill();
  });
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 512 512"
  aria-hidden="true"
  aria-label="Cargando"
>
  <path
    bind:this={pathEl}
    fill={color}
    style="will-change: d;"
  />
</svg>
