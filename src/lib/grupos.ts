import type { WearerGroup } from '../shared/types';

export const EMOJI_GRUPO: Record<WearerGroup, string> = {
  'niño': '🧒',
  'adulto mayor': '👵',
  alzheimer: '🧠',
  tea: '💙',
  discapacidad: '🦾',
  mascota: '🐕',
};

export const NOMBRE_GRUPO: Record<WearerGroup, string> = {
  'niño': 'Niño / Niña',
  'adulto mayor': 'Adulto mayor',
  alzheimer: 'Persona con Alzheimer',
  tea: 'Espectro autista',
  discapacidad: 'Persona con discapacidad',
  mascota: 'Mascota',
};
