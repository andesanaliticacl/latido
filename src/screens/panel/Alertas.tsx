import { useLatido } from '../../state/LatidoStore';
import { META_EVENTO } from '../../components/eventMeta';
import { haceCuanto } from '../../lib/format';

/** Centro de alertas: colores claros, acción clara */
export function Alertas() {
  const { eventos, reconocerEvento } = useLatido();
  const alertas = eventos.filter((e) => META_EVENTO[e.type].esAlerta);
  const pendientes = alertas.filter((e) => !e.acknowledged);
  const atendidas = alertas.filter((e) => e.acknowledged);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Alertas</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Cuando algo necesita tu atención, aparece aquí.
      </p>

      {pendientes.length === 0 && (
        <div className="mt-6 flex items-center gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950">
          <span className="text-4xl">💚</span>
          <div>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              Todo tranquilo
            </div>
            <div className="text-emerald-600 dark:text-emerald-400">
              No hay alertas pendientes en este momento.
            </div>
          </div>
        </div>
      )}

      {pendientes.length > 0 && (
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
            Necesitan tu atención ({pendientes.length})
          </h2>
          {pendientes.map((e) => {
            const meta = META_EVENTO[e.type];
            const esEmergencia = e.type === 'sos' || e.type === 'fall';
            return (
              <div
                key={e.id}
                className={`flex items-center gap-4 rounded-2xl border-2 bg-white p-5 shadow-sm dark:bg-slate-900 ${
                  esEmergencia
                    ? 'border-rose-300 dark:border-rose-800'
                    : 'border-amber-200 dark:border-amber-900'
                }`}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl ${meta.color}`}
                >
                  {meta.icono}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{meta.etiqueta}</div>
                  <div className="text-[15px] text-slate-600 dark:text-slate-300">{e.message}</div>
                  <div className="text-xs text-slate-400">{haceCuanto(e.created_at)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => reconocerEvento(e.id)}
                  className={`shrink-0 rounded-xl px-4 py-2.5 font-semibold text-white transition ${
                    esEmergencia
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Atendida ✓
                </button>
              </div>
            );
          })}
        </div>
      )}

      {atendidas.length > 0 && (
        <div className="mt-8 space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
            Ya atendidas
          </h2>
          {atendidas.slice(0, 20).map((e) => {
            const meta = META_EVENTO[e.type];
            return (
              <div
                key={e.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 opacity-70 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="text-xl">{meta.icono}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px]">{e.message}</div>
                  <div className="text-xs text-slate-400">{haceCuanto(e.created_at)}</div>
                </div>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
