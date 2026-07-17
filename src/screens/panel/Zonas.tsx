import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useLatido } from '../../state/LatidoStore';
import { MapView } from '../../components/MapView';
import type { LatLng, ZoneKind } from '../../shared/types';

const ICONOS = ['🏠', '🏫', '👵', '🌳', '🐾', '⚽', '🏥', '⛪'];

/** Crear zonas tocando el mapa: nada de coordenadas a mano */
export function Zonas() {
  const { zonas, ultima, crearZona, eliminarZona } = useLatido();
  const [borradorPos, setBorradorPos] = useState<LatLng | null>(null);
  const [nombre, setNombre] = useState('');
  const [icono, setIcono] = useState('🏠');
  const [kind, setKind] = useState<ZoneKind>('safe');
  const [radio, setRadio] = useState(150);
  const [guardando, setGuardando] = useState(false);

  const posicion = ultima ? { lat: ultima.lat, lng: ultima.lng } : null;

  const guardar = async () => {
    if (!borradorPos || !nombre.trim()) return;
    setGuardando(true);
    await crearZona({
      name: nombre.trim(),
      icon: icono,
      kind,
      lat: borradorPos.lat,
      lng: borradorPos.lng,
      radius_m: radio,
    });
    setGuardando(false);
    setBorradorPos(null);
    setNombre('');
    setRadio(150);
    setKind('safe');
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4 lg:flex-row">
      {/* Mapa para elegir el centro de la zona */}
      <div className="h-[45vh] min-w-0 shrink-0 lg:h-auto lg:flex-[7]">
        <MapView
          posicion={posicion}
          zonas={zonas}
          onClickMapa={setBorradorPos}
          zonaBorrador={borradorPos ? { pos: borradorPos, radio, kind } : null}
        />
      </div>

      <div className="flex flex-col gap-4 lg:flex-[3] lg:overflow-y-auto lg:pr-1">
        {/* Formulario */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold">Nueva zona</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {borradorPos
              ? 'Perfecto. Ahora dale un nombre y ajusta el tamaño.'
              : '1. Toca el mapa donde quieras crear la zona.'}
          </p>

          {borradorPos && (
            <div className="mt-4 space-y-4">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre: Casa, Colegio, Parque…"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[16px] outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
              />

              <div>
                <div className="mb-2 text-sm font-medium text-slate-500">Icono</div>
                <div className="flex flex-wrap gap-2">
                  {ICONOS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcono(ic)}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 text-xl transition ${
                        icono === ic
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setKind('safe')}
                  className={`rounded-xl border-2 px-3 py-2.5 font-semibold transition ${
                    kind === 'safe'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'border-slate-200 text-slate-500 dark:border-slate-700'
                  }`}
                >
                  ✅ Zona segura
                </button>
                <button
                  type="button"
                  onClick={() => setKind('risk')}
                  className={`rounded-xl border-2 px-3 py-2.5 font-semibold transition ${
                    kind === 'risk'
                      ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : 'border-slate-200 text-slate-500 dark:border-slate-700'
                  }`}
                >
                  ⚠️ Zona de riesgo
                </button>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-500">Tamaño de la zona</span>
                  <span className="font-bold">{radio} m</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={1000}
                  step={25}
                  value={radio}
                  onChange={(e) => setRadio(Number(e.target.value))}
                  className="mt-1 w-full accent-blue-600"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!nombre.trim() || guardando}
                  onClick={guardar}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-[16px] font-semibold text-white transition hover:bg-blue-700 disabled:opacity-40"
                >
                  {guardando ? 'Guardando…' : 'Guardar zona'}
                </button>
                <button
                  type="button"
                  onClick={() => setBorradorPos(null)}
                  className="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-500 dark:border-slate-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lista de zonas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold">Zonas creadas</h2>
          {zonas.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">
              Aún no hay zonas. Crea la primera: «Casa» es un buen comienzo 💙
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {zonas.map((z) => (
                <li
                  key={z.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                >
                  <span className="text-2xl">{z.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{z.name}</div>
                    <div
                      className={`text-xs font-semibold ${
                        z.kind === 'safe'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-500'
                      }`}
                    >
                      {z.kind === 'safe' ? 'Zona segura' : 'Zona de riesgo'} · {z.radius_m} m
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarZona(z.id)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                    title={`Eliminar ${z.name}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
