import { useState } from 'react';
import { useLatido } from '../../state/LatidoStore';
import { EMOJI_GRUPO, NOMBRE_GRUPO } from '../../lib/grupos';
import { haceCuanto } from '../../lib/format';

/** Perfil: LATIDO cuida a una persona con nombre y cara, no a un device_id */
export function Perfil() {
  const { device, ultima, enLinea, actualizarDispositivo } = useLatido();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState('');
  const [contactoNombre, setContactoNombre] = useState('');
  const [contactoTel, setContactoTel] = useState('');

  if (!device) {
    return (
      <div className="p-10 text-center text-slate-400">
        Cargando perfil… Si esto no avanza, revisa que el esquema SQL esté ejecutado en Supabase.
      </div>
    );
  }

  const empezarEdicion = () => {
    setNombre(device.wearer_name);
    setContactoNombre(device.emergency_contact_name ?? '');
    setContactoTel(device.emergency_contact_phone ?? '');
    setEditando(true);
  };

  const guardar = async () => {
    await actualizarDispositivo({
      wearer_name: nombre.trim() || device.wearer_name,
      emergency_contact_name: contactoNombre.trim() || null,
      emergency_contact_phone: contactoTel.trim() || null,
    });
    setEditando(false);
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Perfil</h1>

      {/* Persona protegida */}
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-5xl dark:bg-blue-950">
            {device.photo_url ? (
              <img
                src={device.photo_url}
                alt={device.wearer_name}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              EMOJI_GRUPO[device.wearer_group]
            )}
          </div>
          <div>
            <div className="text-2xl font-bold">{device.wearer_name}</div>
            <div className="text-slate-500 dark:text-slate-400">
              {device.wearer_age != null ? `${device.wearer_age} años · ` : ''}
              {NOMBRE_GRUPO[device.wearer_group]}
            </div>
            <span
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                enLinea
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${enLinea ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {enLinea ? 'Protegido y en línea' : 'Reloj sin conexión'}
            </span>
          </div>
        </div>

        {!editando ? (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
              <span className="text-2xl">📞</span>
              <div>
                <div className="text-sm text-slate-400">Contacto principal</div>
                <div className="font-semibold">
                  {device.emergency_contact_name ?? 'Sin definir'}
                  {device.emergency_contact_phone ? ` · ${device.emergency_contact_phone}` : ''}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={empezarEdicion}
              className="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              ✏️ Editar información
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-500">Nombre</span>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-500">Contacto principal</span>
              <input
                value={contactoNombre}
                onChange={(e) => setContactoNombre(e.target.value)}
                placeholder="Mamá, Papá, Cuidador…"
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-500">Teléfono</span>
              <input
                value={contactoTel}
                onChange={(e) => setContactoTel(e.target.value)}
                placeholder="+56 9 …"
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={guardar}
                className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-500 dark:border-slate-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dispositivo asociado */}
      <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold">Dispositivo asociado</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <div className="text-sm text-slate-400">Modelo</div>
            <div className="font-semibold">⌚ {device.name}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400">Estado</div>
            <div className={`font-semibold ${enLinea ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              {enLinea ? 'En línea' : 'Sin conexión'}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400">Batería</div>
            <div className="font-semibold">{ultima ? `🔋 ${ultima.battery}%` : '—'}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400">Última señal</div>
            <div className="font-semibold">{ultima ? haceCuanto(ultima.recorded_at) : '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
