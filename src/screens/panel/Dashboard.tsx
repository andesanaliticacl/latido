import { Link } from 'react-router-dom';
import { useLatido } from '../../state/LatidoStore';
import { MapView } from '../../components/MapView';
import { StatCard } from '../../components/StatCard';
import { Sparkline } from '../../components/Sparkline';
import { META_EVENTO } from '../../components/eventMeta';
import { haceCuanto, horaCorta } from '../../lib/format';
import { zonasQueContienen } from '../../lib/geo';
import { EMOJI_GRUPO } from '../../lib/grupos';

export function Dashboard() {
  const { ultima, recientes, recorrido, zonas, eventos, enLinea, sosActivo, device } =
    useLatido();

  const posicion = ultima ? { lat: ultima.lat, lng: ultima.lng } : null;
  const zonaActual = posicion ? zonasQueContienen(posicion, zonas)[0] : undefined;
  const pulsos = recientes.map((t) => t.heart_rate).filter((v) => v > 0);
  const recientesEventos = eventos.slice(0, 5);

  const calidadSenal = (s: number) =>
    s >= 75 ? 'Excelente' : s >= 50 ? 'Buena' : s >= 25 ? 'Regular' : 'Débil';

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Mapa: el protagonista (~70%) */}
      <div className="min-w-0 flex-[7]">
        <MapView
          posicion={posicion}
          recorrido={recorrido}
          zonas={zonas}
          sosActivo={sosActivo}
          emojiPersona={EMOJI_GRUPO[device?.wearer_group ?? 'niño']}
        />
      </div>

      {/* Columna de estado en vivo */}
      <div className="flex flex-[3] flex-col gap-3 overflow-y-auto pr-1">
        <StatCard
          icono={<span className="animate-heartbeat inline-block">❤️</span>}
          titulo="Frecuencia cardíaca"
          valor={
            ultima && ultima.heart_rate > 0 ? (
              <span>
                {ultima.heart_rate}{' '}
                <span className="text-base font-medium text-slate-400">lpm</span>
              </span>
            ) : (
              '—'
            )
          }
          detalle={<Sparkline valores={pulsos.slice(-30)} />}
          tono={
            ultima && (ultima.heart_rate > 120 || (ultima.heart_rate > 0 && ultima.heart_rate < 45))
              ? 'atencion'
              : 'normal'
          }
        />

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icono="🔋"
            titulo="Batería"
            valor={ultima ? `${ultima.battery}%` : '—'}
            tono={ultima && ultima.battery < 20 ? 'atencion' : 'normal'}
          />
          <StatCard
            icono="🚶"
            titulo="Velocidad"
            valor={
              ultima ? (
                <span>
                  {ultima.speed_kmh.toFixed(0)}{' '}
                  <span className="text-base font-medium text-slate-400">km/h</span>
                </span>
              ) : (
                '—'
              )
            }
          />
          <StatCard
            icono="🛰"
            titulo="Señal"
            valor={ultima ? calidadSenal(ultima.signal) : '—'}
          />
          <StatCard
            icono="⌚"
            titulo="Estado del reloj"
            valor={
              <span className={enLinea ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                {enLinea ? 'En línea' : 'Sin conexión'}
              </span>
            }
            detalle={ultima ? `Actualizado ${haceCuanto(ultima.recorded_at)}` : 'Esperando datos…'}
            tono={enLinea ? 'ok' : 'normal'}
          />
        </div>

        <StatCard
          icono="🚨"
          titulo="Estado SOS"
          valor={
            sosActivo ? (
              <span className="text-rose-600 dark:text-rose-400">¡EMERGENCIA!</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">Todo tranquilo</span>
            )
          }
          detalle={
            zonaActual
              ? `${zonaActual.icon} Está en «${zonaActual.name}»`
              : posicion
                ? 'Fuera de zonas conocidas'
                : undefined
          }
          tono={sosActivo ? 'emergencia' : 'ok'}
        />

        {/* Eventos recientes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Eventos recientes
            </div>
            <Link to="/historial" className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Ver historial
            </Link>
          </div>
          {recientesEventos.length === 0 ? (
            <p className="text-sm text-slate-400">Sin eventos todavía. Todo en calma 💙</p>
          ) : (
            <ul className="space-y-2.5">
              {recientesEventos.map((e) => {
                const meta = META_EVENTO[e.type];
                return (
                  <li key={e.id} className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${meta.color}`}
                    >
                      {meta.icono}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px]">{e.message}</div>
                      <div className="text-xs text-slate-400">{horaCorta(e.created_at)}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
