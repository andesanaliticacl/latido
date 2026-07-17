import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Toggle } from '../../components/Toggle';
import { useLatido } from '../../state/LatidoStore';

interface SubApp {
  nombre: string;
  permitida: boolean;
}

/** Un "conglomerado": una categoría que agrupa varias apps individuales */
interface Categoria {
  clave: string;
  nombre: string;
  icono: string;
  permitida: boolean;
  items: SubApp[];
}

interface Config {
  categorias: Categoria[];
  horarioEscolar: boolean;
  modoDescanso: boolean;
  modoEmergencia: boolean;
}

const CONFIG_INICIAL: Config = {
  horarioEscolar: true,
  modoDescanso: false,
  modoEmergencia: false,
  categorias: [
    {
      clave: 'comunicacion',
      nombre: 'Comunicación',
      icono: '📞',
      permitida: true,
      items: [
        { nombre: 'Llamadas familia', permitida: true },
        { nombre: 'Mensajes de voz', permitida: true },
        { nombre: 'Videollamada', permitida: false },
      ],
    },
    {
      clave: 'juegos',
      nombre: 'Juegos',
      icono: '🎮',
      permitida: true,
      items: [
        { nombre: 'Rompecabezas', permitida: true },
        { nombre: 'Juego de memoria', permitida: true },
        { nombre: 'Colorear', permitida: true },
        { nombre: 'Matemáticas divertidas', permitida: true },
        { nombre: 'Carreras', permitida: false },
      ],
    },
    {
      clave: 'multimedia',
      nombre: 'Multimedia',
      icono: '🎵',
      permitida: true,
      items: [
        { nombre: 'Cámara', permitida: true },
        { nombre: 'Música', permitida: true },
        { nombre: 'Galería de fotos', permitida: true },
      ],
    },
    {
      clave: 'pagos',
      nombre: 'Pagos',
      icono: '💳',
      permitida: false,
      items: [
        { nombre: 'Pago escolar', permitida: false },
        { nombre: 'Kiosco', permitida: false },
      ],
    },
  ],
};

const CLAVE_LS = 'latido.control-parental.v2';

/** Control parental: interruptores simples con categorías que se despliegan.
 *  MVP: se guarda localmente; en Fase 2 la configuración viaja al reloj. */
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
  const [abiertas, setAbiertas] = useState<Set<string>>(new Set());

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

  const alternarAbierta = (clave: string) =>
    setAbiertas((prev) => {
      const s = new Set(prev);
      if (s.has(clave)) s.delete(clave);
      else s.add(clave);
      return s;
    });

  const setCategoria = (clave: string, cambios: Partial<Categoria>) =>
    setConfig((c) => ({
      ...c,
      categorias: c.categorias.map((cat) => (cat.clave === clave ? { ...cat, ...cambios } : cat)),
    }));

  const setItem = (clave: string, indice: number, permitida: boolean) =>
    setConfig((c) => ({
      ...c,
      categorias: c.categorias.map((cat) =>
        cat.clave === clave
          ? { ...cat, items: cat.items.map((it, i) => (i === indice ? { ...it, permitida } : it)) }
          : cat,
      ),
    }));

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
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

      {/* Aplicaciones por categoría */}
      <h2 className="mt-8 text-lg font-bold">Aplicaciones del reloj</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Activa una categoría y elige, dentro de ella, qué apps permitir.
      </p>
      <div className="mt-3 space-y-3">
        {config.categorias.map((cat) => {
          const abierta = abiertas.has(cat.clave);
          const permitidas = cat.items.filter((i) => i.permitida).length;
          return (
            <div
              key={cat.clave}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Cabecera de la categoría */}
              <div className="flex items-center gap-3 p-4">
                <button
                  type="button"
                  onClick={() => alternarAbierta(cat.clave)}
                  className="flex flex-1 items-center gap-3 text-left"
                  aria-expanded={abierta}
                >
                  <span className="text-2xl">{cat.icono}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{cat.nombre}</div>
                    <div
                      className={`text-xs font-semibold ${
                        cat.permitida
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {cat.permitida
                        ? `${permitidas} de ${cat.items.length} permitidas`
                        : 'Categoría bloqueada'}
                    </div>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-slate-400 transition-transform ${abierta ? 'rotate-180' : ''}`}
                  />
                </button>
                <Toggle
                  activo={cat.permitida}
                  etiqueta={cat.nombre}
                  onCambio={(v) => {
                    setCategoria(cat.clave, { permitida: v });
                    if (v && !abierta) alternarAbierta(cat.clave);
                  }}
                />
              </div>

              {/* Listado anidado de apps */}
              {abierta && (
                <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-950">
                  {!cat.permitida && (
                    <p className="py-2 text-sm text-slate-400">
                      Activa la categoría «{cat.nombre}» para elegir sus aplicaciones.
                    </p>
                  )}
                  {cat.items.map((item, i) => (
                    <div
                      key={item.nombre}
                      className={`flex items-center gap-3 py-2.5 ${
                        cat.permitida ? '' : 'pointer-events-none opacity-40'
                      }`}
                    >
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <div className="flex-1">
                        <div className="text-[15px] font-medium">{item.nombre}</div>
                        <div
                          className={`text-xs font-semibold ${
                            cat.permitida && item.permitida
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {cat.permitida && item.permitida ? 'Permitida' : 'Bloqueada'}
                        </div>
                      </div>
                      <Toggle
                        activo={item.permitida}
                        etiqueta={item.nombre}
                        onCambio={(v) => setItem(cat.clave, i, v)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
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
