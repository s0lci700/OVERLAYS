import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'Dados & Risas — TableRelay',
    brandUrl: 'https://github.com/s0lci700/OVERLAYS',
    colorPrimary: '#500df5',
    colorSecondary: '#00c2ff',
    appBg: '#070B14',
    appContentBg: '#0e1525',
    barBg: '#0e1525',
    textColor: '#e2e8f0',
    textMutedColor: '#94a3b8',
  }),
});
