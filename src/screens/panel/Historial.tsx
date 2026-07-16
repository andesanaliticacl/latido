import { useLatido } from '../../state/LatidoStore';
import { META_EVENTO } from '../../components/eventMeta';
import { claveDia, fechaLarga, horaCorta } from '../../lib/format';
import type { AlertEvent } from '../../shared/types';

/** El día contado como una historia: timeline visual, sin tablas */
export function Historial() {
  const { eventos, device } = useLatido();

  const porDia = new Map<string, AlertEvent[]>();
  for (const e of eventos) {
    const k = claveDia(e.created_at);
    const lista = porDia.get(k) ?? [];
    lista.push(e);
    porDia.set(k, lista);
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">El día de {device?.wearer_name ?? 'tu persona protegida'}</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Cada momento importante, contado de forma simple.
      </p>

      {eventos.length === 0 && (
        <div className="mt-10 rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-400 dark:border-slate-700">
          <div className="text-4xl">🕊️</div>
          <p className="mt-3">Aún no hay eventos. Cuando el reloj empiece a transmitir, la historia del día aparecerá aquí.</p>
        </div>
      )}

      {[...porDia.entries()].map(([dia, lista]) => (
        <section key={dia} className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
            {fechaLarga(lista[0].created_at)}
          </h2>
          <ol className="relative mt-4 space-y-6 border-l-2 border-slate-200 pl-6 dark:border-slate-800">
            {lista.map((e) => {
              const meta = META_EVENTO[e.type];
              return (
                <li key={e.id} className="relative">
                  <span
                    className={`absolute -left-[37px] flex h-9 w-9 items-center justify-center rounded-full border-4 border-slate-50 text-base dark:border-slate-950 ${meta.color}`}
                  >
                    {meta.icono}
                  </span>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-sm font-bold text-slate-400">{horaCorta(e.created_at)}</div>
                    <div className="mt-0.5 text-[16px] font-medium">{e.message}</div>
                    {meta.esAlerta && (
                      <span
                        className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}
                      >
                        {meta.etiqueta}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
