import d4 from './d4.svg?raw';
import d6 from './d6.svg?raw';
import d8 from './d8.svg?raw';
import d10 from './d10.svg?raw';
import d12 from './d12.svg?raw';
import d20 from './d20.svg?raw';

export type dieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
export interface Die {
	type: dieType;
	svg: {
		raw: string;
		alt: string;
		style?: string;
	};
}

export const DIE_RAW: Record<dieType, string> = {
	d4,
	d6,
	d8,
	d10,
	d12,
	d20
};

export function getDieSVG(type: dieType): Die {
	switch (type) {
		case 'd4':
			return { type: 'd4', svg: { raw: d4, alt: 'D4 Die' } };
		case 'd6':
			return { type: 'd6', svg: { raw: d6, alt: 'D6 Die' } };
		case 'd8':
			return { type: 'd8', svg: { raw: d8, alt: 'D8 Die' } };
		case 'd10':
			return { type: 'd10', svg: { raw: d10, alt: 'D10 Die' } };
		case 'd12':
			return { type: 'd12', svg: { raw: d12, alt: 'D12 Die' } };
		case 'd20':
			return { type: 'd20', svg: { raw: d20, alt: 'D20 Die' } };
		default:
			console.error(`Unknown die type: ${type}`);
			return { type: 'd6', svg: { raw: d6, alt: 'Unknown Die' } };
	}
}

export const DIE_SVG_MAP: Record<dieType, Die> = {
	d4: getDieSVG('d4'),
	d6: getDieSVG('d6'),
	d8: getDieSVG('d8'),
	d10: getDieSVG('d10'),
	d12: getDieSVG('d12'),
	d20: getDieSVG('d20')
};
