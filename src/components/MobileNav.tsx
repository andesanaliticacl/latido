import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { MoreHorizontal, Moon, Smartphone, Sun, X } from 'lucide-react';
import { useLatido } from '../state/LatidoStore';
import { NAV_ITEMS, RUTAS_PRIMARIAS } from './navItems';

interface Props {
  oscuro: boolean;
  onCambiarTema: () => void;
}

/** Cabecera compacta del celular (logo + estado) — visible solo bajo lg */
export function MobileHeader() {
  const { enLinea } = useLatido();
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <span className="animate-heartbeat text-xl">💙</span>
        <span className="text-lg font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
          LATIDO
        </span>
      </div>
      <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        <span className={`h-2.5 w-2.5 rounded-full ${enLinea ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        {enLinea ? 'En línea' : 'Sin conexión'}
      </span>
    </header>
  );
}

/** Barra de navegación inferior del celular — estilo app nativa */
export function MobileNav({ oscuro, onCambiarTema }: Props) {
  const [masAbierto, setMasAbierto] = useState(false);
  const { eventos } = useLatido();
  const pendientes = eventos.filter((e) => !e.acknowledged && e.type !== 'info').length;

  const primarias = NAV_ITEMS.filter((i) => RUTAS_PRIMARIAS.includes(i.a));
  const secundarias = NAV_ITEMS.filter((i) => !RUTAS_PRIMARIAS.includes(i.a));

  return (
    <>
      {/* Hoja "Más" */}
      {masAbierto && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMasAbierto(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-2xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-lg font-bold">Más opciones</span>
              <button
                type="button"
                onClick={() => setMasAbierto(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Cerrar"
              >
                <X size={22} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {secundarias.map(({ a, icono: Icono, texto }) => (
                <NavLink
                  key={a}
                  to={a}
                  onClick={() => setMasAbierto(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl border p-4 text-[15px] font-medium ${
                      isActive
                        ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-300'
                    }`
                  }
                >
                  <Icono size={20} />
                  {texto}
                </NavLink>
              ))}
              <a
                href="/watch"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-[15px] font-medium text-slate-600 dark:border-slate-800 dark:text-slate-300"
              >
                <Smartphone size={20} />
                Abrir simulador
              </a>
              <button
                type="button"
                onClick={() => {
                  onCambiarTema();
                  setMasAbierto(false);
                }}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-[15px] font-medium text-slate-600 dark:border-slate-800 dark:text-slate-300"
              >
                {oscuro ? <Sun size={20} /> : <Moon size={20} />}
                {oscuro ? 'Modo claro' : 'Modo oscuro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra inferior fija */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden dark:border-slate-800 dark:bg-slate-900">
        {primarias.map(({ a, icono: Icono, textoCorto, exacto }) => (
          <NavLink
            key={a}
            to={a}
            end={exacto}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <Icono size={22} />
            {textoCorto}
            {a === '/alertas' && pendientes > 0 && (
              <span className="absolute right-[calc(50%-1.4rem)] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {pendientes}
              </span>
            )}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMasAbierto(true)}
          className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-slate-500 dark:text-slate-400"
        >
          <MoreHorizontal size={22} />
          Más
        </button>
      </nav>
    </>
  );
}
