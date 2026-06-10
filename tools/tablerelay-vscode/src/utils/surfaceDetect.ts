export type Surface = 'Stage' | 'Cast' | 'Audience' | 'Backend' | 'Contracts' | 'UI Kit';

export function detectSurface(filePath: string): Surface | null {
  const p = filePath.replace(/\\/g, '/');
  if (p.includes('routes/(stage)') || p.includes('components/stage')) return 'Stage';
  if (p.includes('routes/(cast)') || p.includes('components/cast')) return 'Cast';
  if (p.includes('routes/(audience)') || p.includes('components/overlays')) return 'Audience';
  if (p.includes('/backend/') || p.includes('\\backend\\')) return 'Backend';
  if (p.includes('lib/contracts')) return 'Contracts';
  if (p.includes('lib/components/shared')) return 'UI Kit';
  return null;
}

export const SURFACE_BADGES: Record<Surface, string> = {
  Stage:     'S',
  Cast:      'C',
  Audience:  'A',
  Backend:   'B',
  Contracts: '◇',
  'UI Kit':  'U',
};

// Maps to VS Code built-in ThemeColor keys
export const SURFACE_COLORS: Record<Surface, string> = {
  Stage:     'charts.yellow',
  Cast:      'charts.green',
  Audience:  'charts.blue',
  Backend:   'charts.purple',
  Contracts: 'charts.orange',
  'UI Kit':  'charts.red',
};
