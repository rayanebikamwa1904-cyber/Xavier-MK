import { TemplateConfig } from '../types.ts';

export const templateConfig: TemplateConfig = {
  themes: [
    {
      id: 'luxe',
      name: 'Luxe',
      font: 'Cormorant Garamond',
      palette: {
        background: '#0A0A0A',
        text: '#EAEAEA',
        primary: '#D4AF37',
        accent: '#FFFFFF',
      },
    },
    {
      id: 'minimal',
      name: 'Minimal',
      font: 'Inter',
      palette: {
        background: '#FFFFFF',
        text: '#111111',
        primary: '#000000',
        accent: '#555555',
      },
    },
  ],
};
