import type { ReactNode } from 'react';

interface Props {
  icono: ReactNode;
  titulo: string;
  valor: ReactNode;
  detalle?: ReactNode;
  /** acento visual opcional: ok | atencion | emergencia */
  tono?: 'normal' | 'ok' | 'atencion' | 'emergencia';
}

const TONOS = {
  normal: 'border-slate-200 dark:border-slate-800',
  ok: 'border-emerald-200 dark:border-emerald-900',
  atencion: 'border-amber-300 dark:border-amber-800',
  emergencia: 'border-rose-300 ring-2 ring-rose-200 dark:border-rose-800 dark:ring-rose-900',
};

/** Tarjeta de estado: grande, amable, legible de un vistazo */
export function StatCard({ icono, titulo, valor, detalle, tono = 'normal' }: Props) {
  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900 ${TONOS[tono]}`}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
        <span className="text-xl leading-none">{icono}</span>
        {titulo}
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight">{valor}</div>
      {detalle != null && (
        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{detalle}</div>
      )}
    </div>
  );
}
