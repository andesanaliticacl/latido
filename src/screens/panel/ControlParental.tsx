import { useEffect, useState } from 'react';
import { Toggle } from '../../components/Toggle';
import { useLatido } from '../../state/LatidoStore';

interface AppItem {
  nombre: string;
  icono: string;
  permitida: boolean;
}

interface Config {
  horarioEscolar: boolean;
  modoDescanso: boolean;
  modoEmergencia: boolean;
  apps: AppItem[];
}

const CONFIG_INICIAL: Config = {
  horarioEscolar: true,
  modoDescanso: false,
  modoEmergencia: false,
  apps: [
    { nombre: 'Llamadas familia', icono: '📞', permitida: true },
    { nombre: 'Mensajes de voz', icono: '🎙️', permitida: true },
    { nombre: 'Cámara', icono: '📷', permitida: true },
    { nombre: 'Juegos', icono: '🎮', permitida: false },
    { nombre: 'Música', icono: '🎵', permitida: true },
    { nombre: 'Pagos', icono: '💳', permitida: false },
  ],
};

const CLAVE_LS = 'latido.control-parental';

/** Control parental: interruptores simples, cero menús técnicos.
 *  MVP: se guarda localmente; en Fase 2 viaja al reloj. */
export function ControlParental() {
  const { device } = useLatido();
  const [config, setConfig] = useState<Config>(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_LS);
      return guardado ? (JSON.parse(guardado) as Config) : CONFIG_INICIAL;
    } catch {
      return CONFIG_INICIAL;
    }
  });

  useEffect(() => {
    localStorage.setItem(CLAVE_LS, JSON.stringify(config));
  }, [config]);

  const modos = [
    {
      clave: 'horarioEscolar' as const,
      icono: '🏫',
      titulo: 'Horario escolar',
      detalle: 'De lunes a viernes, 8:00 a 16:00 el reloj solo permite llamadas de la familia.',
    },
    {
      clave: 'modoDescanso' as const,
      icono: '🌙',
      titulo: 'Modo descanso',
      detalle: 'De 21:30 a 7:00 la pantalla se atenúa y se silencian las notificaciones.',
    },
    {
      clave: 'modoEmergencia' as const,
      icono: '🚨',
      titulo: 'Modo emergencia',
      detalle: 'Ubicación cada 10 segundos y micrófono listo. Usar solo si algo anda mal.',
    },
  ];

  const usoDia = [
    { etiqueta: 'Llamadas', icono: '📞', minutos: 12, max: 60 },
    { etiqueta: 'Música', icono: '🎵', minutos: 25, max: 60 },
    { etiqueta: 'Pantalla total', icono: '⌚', minutos: 47, max: 120 },
  ];

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Control parental</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Configura el reloj de {device?.wearer_name ?? 'tu persona protegida'} con interruptores simples.
      </p>

      {/* Modos */}
      <div className="mt-6 space-y-3">
        {modos.map((m) => (
          <div
            key={m.clave}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="text-3xl">{m.icono}</span>
            <div className="flex-1">
              <div className="text-[17px] font-semibold">{m.titulo}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{m.detalle}</div>
            </div>
            <Toggle
              activo={config[m.clave]}
              etiqueta={m.titulo}
              onCambio={(v) => setConfig((c) => ({ ...c, [m.clave]: v }))}
            />
          </div>
        ))}
      </div>

      {/* Apps */}
      <h2 className="mt-8 text-lg font-bold">Aplicaciones del reloj</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Decide qué puede usar y qué no.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {config.apps.map((app, i) => (
          <div
            key={app.nombre}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="text-2xl">{app.icono}</span>
            <div className="flex-1">
              <div className="font-medium">{app.nombre}</div>
              <div
                className={`text-xs font-semibold ${
                  app.permitida ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                }`}
              >
                {app.permitida ? 'Permitida' : 'Bloqueada'}
              </div>
            </div>
            <Toggle
              activo={app.permitida}
              etiqueta={app.nombre}
              onCambio={(v) =>
                setConfig((c) => ({
                  ...c,
                  apps: c.apps.map((a, j) => (j === i ? { ...a, permitida: v } : a)),
                }))
              }
            />
          </div>
        ))}
      </div>

      {/* Tiempo de uso */}
      <h2 className="mt-8 text-lg font-bold">Tiempo de uso hoy</h2>
      <div className="mt-3 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        {usoDia.map((u) => (
          <div key={u.etiqueta}>
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {u.icono} {u.etiqueta}
              </span>
              <span className="text-slate-400">{u.minutos} min</span>
            </div>
            <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-400"
                style={{ width: `${Math.min(100, (u.minutos / u.max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
        <p className="text-xs text-slate-400">
          Demo: datos de uso simulados. Los reales llegan con el reloj físico (Fase 2).
        </p>
      </div>
    </div>
  );
}
