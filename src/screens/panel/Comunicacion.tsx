import { useEffect, useRef, useState } from 'react';
import { Ear, Phone, PhoneOff } from 'lucide-react';
import { useLatido } from '../../state/LatidoStore';
import { EMOJI_GRUPO } from '../../lib/grupos';

type EstadoLlamada = 'inactiva' | 'llamando' | 'conectada';
type TipoLlamada = 'voz' | 'escucha';

interface RegistroLlamada {
  tipo: TipoLlamada;
  hora: string;
  duracion: number;
}

/** Interfaz de llamadas (simulada en el MVP: solo UI, sin audio real) */
export function Comunicacion() {
  const { device, enLinea } = useLatido();
  const [estado, setEstado] = useState<EstadoLlamada>('inactiva');
  const [tipo, setTipo] = useState<TipoLlamada>('voz');
  const [segundos, setSegundos] = useState(0);
  const [historial, setHistorial] = useState<RegistroLlamada[]>([
    { tipo: 'voz', hora: 'Ayer, 18:32', duracion: 154 },
    { tipo: 'escucha', hora: 'Ayer, 13:05', duracion: 40 },
    { tipo: 'voz', hora: 'Lunes, 08:15', duracion: 62 },
  ]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const iniciar = (t: TipoLlamada) => {
    setTipo(t);
    setEstado('llamando');
    setSegundos(0);
    setTimeout(() => {
      setEstado((prev) => {
        if (prev !== 'llamando') return prev;
        timer.current = setInterval(() => setSegundos((s) => s + 1), 1000);
        return 'conectada';
      });
    }, 2500);
  };

  const colgar = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    if (estado === 'conectada') {
      setHistorial((h) => [
        { tipo, hora: 'Recién', duracion: segundos },
        ...h,
      ]);
    }
    setEstado('inactiva');
    setSegundos(0);
  };

  const mmss = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const nombre = device?.wearer_name ?? 'el reloj';
  const emoji = EMOJI_GRUPO[device?.wearer_group ?? 'niño'];

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Comunicación</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Habla con {nombre} directamente a su reloj.
      </p>

      {/* Tarjeta de llamada */}
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div
          className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full text-5xl ${
            estado === 'conectada'
              ? 'bg-emerald-100 dark:bg-emerald-950'
              : 'bg-blue-50 dark:bg-blue-950'
          } ${estado === 'llamando' ? 'animate-pulse' : ''}`}
        >
          {emoji}
        </div>
        <div className="mt-4 text-xl font-bold">{device?.wearer_name ?? '—'}</div>
        <div className="mt-1 text-slate-500 dark:text-slate-400">
          {estado === 'inactiva' && (enLinea ? 'Reloj disponible' : 'Reloj sin conexión')}
          {estado === 'llamando' && (tipo === 'voz' ? 'Llamando al reloj…' : 'Activando escucha del entorno…')}
          {estado === 'conectada' && (
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {tipo === 'voz' ? 'En llamada' : 'Escuchando entorno'} · {mmss(segundos)}
            </span>
          )}
        </div>

        <div className="mt-6 flex justify-center gap-4">
          {estado === 'inactiva' ? (
            <>
              <button
                type="button"
                onClick={() => iniciar('voz')}
                className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-lg font-semibold text-white shadow transition hover:bg-emerald-600"
              >
                <Phone size={22} /> Llamar
              </button>
              <button
                type="button"
                onClick={() => iniciar('escucha')}
                className="flex items-center gap-2 rounded-2xl bg-blue-500 px-6 py-3.5 text-lg font-semibold text-white shadow transition hover:bg-blue-600"
              >
                <Ear size={22} /> Escuchar entorno
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={colgar}
              className="flex items-center gap-2 rounded-2xl bg-rose-500 px-8 py-3.5 text-lg font-semibold text-white shadow transition hover:bg-rose-600"
            >
              <PhoneOff size={22} /> Finalizar
            </button>
          )}
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Demo: la llamada es simulada. La voz real llega con el reloj físico (Fase 2).
        </p>
      </div>

      {/* Historial */}
      <h2 className="mt-8 text-lg font-bold">Llamadas recientes</h2>
      <ul className="mt-3 space-y-2">
        {historial.map((ll, i) => (
          <li
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-full text-xl ${
                ll.tipo === 'voz'
                  ? 'bg-emerald-100 dark:bg-emerald-950'
                  : 'bg-blue-100 dark:bg-blue-950'
              }`}
            >
              {ll.tipo === 'voz' ? '📞' : '👂'}
            </span>
            <div className="flex-1">
              <div className="font-medium">
                {ll.tipo === 'voz' ? 'Llamada de voz' : 'Escucha de entorno'}
              </div>
              <div className="text-sm text-slate-400">{ll.hora}</div>
            </div>
            <div className="text-sm font-semibold text-slate-500">{mmss(ll.duracion)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
