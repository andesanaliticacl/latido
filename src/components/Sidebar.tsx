import { NavLink } from 'react-router-dom';
import { Moon, Smartphone, Sun } from 'lucide-react';
import { useLatido } from '../state/LatidoStore';
import { NAV_ITEMS } from './navItems';

interface Props {
  oscuro: boolean;
  onCambiarTema: () => void;
}

/** Barra lateral del panel — visible solo en escritorio (lg+) */
export function Sidebar({ oscuro, onCambiarTema }: Props) {
  const { eventos, enLinea } = useLatido();
  const pendientes = eventos.filter((e) => !e.acknowledged && e.type !== 'info').length;

  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-5 lg:flex dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="animate-heartbeat text-2xl">💙</span>
        <div>
          <div className="text-lg font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
            LATIDO
          </div>
          <div className="text-[11px] leading-tight text-slate-400">
            protegemos a quienes quieres
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ a, icono: Icono, texto, exacto }) => (
          <NavLink
            key={a}
            to={a}
            end={exacto}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            <Icono size={20} />
            <span className="flex-1">{texto}</span>
            {a === '/alertas' && pendientes > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white">
                {pendientes}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-slate-800">
        <div className="flex items-center gap-2 px-3 text-sm text-slate-500 dark:text-slate-400">
          <span
            className={`h-2.5 w-2.5 rounded-full ${enLinea ? 'bg-emerald-500' : 'bg-slate-400'}`}
          />
          {enLinea ? 'Reloj en línea' : 'Reloj sin conexión'}
        </div>
        <a
          href="/watch"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Smartphone size={20} />
          Abrir simulador
        </a>
        <button
          type="button"
          onClick={onCambiarTema}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {oscuro ? <Sun size={20} /> : <Moon size={20} />}
          {oscuro ? 'Modo claro' : 'Modo oscuro'}
        </button>
      </div>
    </aside>
  );
}
