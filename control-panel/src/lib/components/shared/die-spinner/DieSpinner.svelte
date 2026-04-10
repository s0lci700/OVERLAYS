<!--
  DieSpinner
  ==========
  Looping die-shape morphing animation via GSAP MorphSVG.
  d4 → d6 → d8 → d10 → d12 → d20 → d4, continuously.
  Both outer shape and inner detail lines morph in sync.

  Usage:
    <DieSpinner />
    <DieSpinner size={48} color="var(--cast-amber)" speed={0.5} />
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
	import { DIE_RAW } from '$lib/assets/dice/die';

	gsap.registerPlugin(MorphSVGPlugin);

	let {
		size = 32,
		color = 'currentColor',
		fillColor = 'transparent',
		speed = 0.55, // seconds per morph
		strokeWidth = 16
	}: {
		size?: number;
		color?: string;
		speed?: number;
		fillColor?: string;
		strokeWidth?: number;
	} = $props();

	const DIE_SEQUENCE = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'] as const;

	// Paths share the same viewBox (0 0 512 512).
	// MorphSVG redistributes vertices automatically across different counts.
	const OUTER_SHAPES: Record<string, string> = {
		d4: 'M256,48 L48,400 L464,400 Z',
		d6: 'M256,80 L436,184 L436,392 L256,496 L76,392 L76,184 Z',
		d8: 'M256,48 L464,256 L256,464 L48,256 Z',
		d10: 'M256,32 L464,224 L256,480 L48,224 Z',
		d12: 'M256,32 L388,75 L469,187 L469,325 L388,437 L256,480 L124,437 L43,325 L43,187 L124,75 Z',
		d20: 'M256,32 L448,144 L448,368 L256,480 L64,368 L64,144 Z'
	};

	function parseInnerDiePath(raw: string): string {
		const doc = new DOMParser().parseFromString(raw, 'image/svg+xml');
		const children = [...doc.querySelector('svg')!.children].slice(1); // skip outer shape
		return children
			.map((el) => {
				const tag = el.tagName.toLowerCase();
				if (tag === 'line') {
					return `M${el.getAttribute('x1')} ${el.getAttribute('y1')} L${el.getAttribute('x2')} ${el.getAttribute('y2')}`;
				}
				if (tag === 'polyline' || tag === 'polygon') {
					const nums = el.getAttribute('points')!.trim().split(/[\s,]+/);
					const pairs: string[] = [];
					for (let i = 0; i < nums.length - 1; i += 2) pairs.push(`${nums[i]} ${nums[i + 1]}`);
					return 'M' + pairs.join(' L') + (tag === 'polygon' ? ' Z' : '');
				}
				return '';
			})
			.filter(Boolean)
			.join(' ');
	}

	let outerPathEl = $state<SVGPathElement | null>(null);
	let innerPathEl = $state<SVGPathElement | null>(null);

	onMount(() => {
		if (!outerPathEl || !innerPathEl) return;

		const INNER_SHAPES: Record<string, string> = Object.fromEntries(
			Object.entries(DIE_RAW).map(([k, raw]) => [k, parseInnerDiePath(raw)])
		);

		outerPathEl.setAttribute('d', OUTER_SHAPES.d4);
		innerPathEl.setAttribute('d', INNER_SHAPES.d4);

		const tl = gsap.timeline({ repeat: -1 });

		const cycle = [...DIE_SEQUENCE.slice(1), 'd4'];
		cycle.forEach((die) => {
			tl.to(outerPathEl, {
				morphSVG: OUTER_SHAPES[die],
				duration: speed,
				ease: 'sine.inOut'
			});
			tl.to(
				innerPathEl,
				{
					morphSVG: INNER_SHAPES[die],
					duration: speed,
					ease: 'sine.inOut'
				},
				'<' // run in sync with the outer morph
			);
		});

		return () => tl.kill();
	});
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 512 512"
	stroke={color}
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	aria-label="Cargando"
>
	<path bind:this={outerPathEl} fill={fillColor} style="will-change: d;" />
	<path bind:this={innerPathEl} fill="none" style="will-change: d;" />
</svg>
