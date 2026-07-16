import type { EventType } from '../shared/types';

export interface EventMeta {
  icono: string;
  etiqueta: string;
  /** clases para la pastilla de color del evento */
  color: string;
  esAlerta: boolean;
}

export const META_EVENTO: Record<EventType, EventMeta> = {
  sos: {
    icono: '🚨',
    etiqueta: 'Botón SOS',
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    esAlerta: true,
  },
  fall: {
    icono: '🤕',
    etiqueta: 'Caída detectada',
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    esAlerta: true,
  },
  hr_high: {
    icono: '❤️‍🔥',
    etiqueta: 'Pulso elevado',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    esAlerta: true,
  },
  hr_low: {
    icono: '💙',
    etiqueta: 'Pulso muy bajo',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    esAlerta: true,
  },
  zone_enter: {
    icono: '🏠',
    etiqueta: 'Entró a zona',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    esAlerta: false,
  },
  zone_exit: {
    icono: '🚪',
    etiqueta: 'Salió de zona',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    esAlerta: true,
  },
  battery_low: {
    icono: '🪫',
    etiqueta: 'Batería baja',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    esAlerta: true,
  },
  offline: {
    icono: '📴',
    etiqueta: 'Sin conexión',
    color: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    esAlerta: true,
  },
  info: {
    icono: 'ℹ️',
    etiqueta: 'Información',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    esAlerta: false,
  },
};
