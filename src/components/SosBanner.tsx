import { Link } from 'react-router-dom';
import { useLatido } from '../state/LatidoStore';
import { haceCuanto } from '../lib/format';

/** Banner rojo global: una emergencia es imposible de no ver */
export function SosBanner() {
  const { eventos, sosActivo, device, reconocerEvento } = useLatido();
  if (!sosActivo) return null;
  const sos = eventos.find((e) => e.type === 'sos' && !e.acknowledged);
  if (!sos) return null;

  return (
    <div className="flex items-center gap-4 bg-rose-600 px-5 py-3 text-white shadow-lg">
      <span className="animate-heartbeat text-3xl">🚨</span>
      <div className="flex-1">
        <div className="text-lg font-bold">
          ¡{device?.wearer_name ?? 'Tu persona protegida'} presionó el botón SOS!
        </div>
        <div className="text-sm text-rose-100">
          {haceCuanto(sos.created_at)} · revisa su ubicación en el mapa
        </div>
      </div>
      <Link
        to="/"
        className="rounded-xl bg-white/20 px-4 py-2 font-semibold hover:bg-white/30"
      >
        Ver mapa
      </Link>
      <button
        type="button"
        onClick={() => reconocerEvento(sos.id)}
        className="rounded-xl bg-white px-4 py-2 font-semibold text-rose-700 hover:bg-rose-50"
      >
        Ya lo vi, voy en camino
      </button>
    </div>
  );
}
