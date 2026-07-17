import { Link } from 'react-router-dom';
import { useLatido } from '../../state/LatidoStore';
import { haceCuanto } from '../../lib/format';
import { zonasQueContienen } from '../../lib/geo';

/** Centro de monitoreo: tarjetas grandes, lenguaje humano, cero tablas */
export function Monitoreo() {
  const { ultima, zonas, enLinea, sosActivo, device, eventos } = useLatido();
  const posicion = ultima ? { lat: ultima.lat, lng: ultima.lng } : null;
  const zonasContiene = posicion ? zonasQueContienen(posicion, zonas) : [];
  const zonaSegura = zonasContiene.find((z) => z.kind === 'safe');
  const zonaRiesgo = zonasContiene.find((z) => z.kind === 'risk');
  const alertasPendientes = eventos.filter((e) => !e.acknowledged && e.type !== 'info').length;
  const bateriaCasiAgotada = Boolean(ultima && ultima.battery <= 10);
  const bateriaBaja = Boolean(ultima && ultima.battery < 20);
  const nombre = device?.wearer_name ?? '—';

  const tarjetas = [
    {
      icono: '❤️',
      titulo: 'Ritmo cardíaco',
      valor: ultima && ultima.heart_rate > 0 ? `${ultima.heart_rate} lpm` : 'Sin datos',
      detalle:
        ultima && ultima.heart_rate > 120
          ? 'Más alto de lo normal'
          : ultima && ultima.heart_rate > 0 && ultima.heart_rate < 45
            ? 'Más bajo de lo normal'
            : 'Dentro de lo normal',
      alerta: Boolean(ultima && (ultima.heart_rate > 120 || (ultima.heart_rate > 0 && ultima.heart_rate < 45))),
      a: '/historial',
    },
    {
      icono: '📍',
      titulo: 'Ubicación',
      valor: zonaSegura
        ? `${zonaSegura.icon} ${zonaSegura.name}`
        : zonaRiesgo
          ? `${zonaRiesgo.icon} ${zonaRiesgo.name}`
          : posicion
            ? 'Fuera de lugar seguro'
            : 'Sin datos',
      detalle: zonaSegura
        ? 'En un lugar seguro registrado'
        : zonaRiesgo
          ? '⚠️ Está en una zona de riesgo'
          : posicion
            ? 'No se encuentra en un lugar seguro registrado'
            : 'Esperando ubicación del reloj',
      alerta: Boolean(zonaRiesgo) || Boolean(posicion && !zonaSegura),
      a: '/',
    },
    {
      icono: bateriaCasiAgotada ? '🪫' : '🔋',
      titulo: 'Batería',
      valor: ultima ? `${ultima.battery}%` : 'Sin datos',
      detalle: bateriaCasiAgotada
        ? '¡Casi agotada! Puede quedar sin conexión pronto'
        : bateriaBaja
          ? 'Batería baja, recuérdale cargar el reloj'
          : 'Batería suficiente',
      alerta: bateriaBaja,
      a: '/perfil',
    },
    {
      icono: '🛰',
      titulo: 'Señal',
      valor: enLinea ? 'Conectado' : 'Sin conexión',
      detalle: ultima ? `Última señal ${haceCuanto(ultima.recorded_at)}` : 'Esperando al reloj…',
      alerta: !enLinea,
      a: '/perfil',
    },
    {
      icono: '🚨',
      titulo: 'Emergencias',
      valor: sosActivo ? '¡SOS activo!' : alertasPendientes > 0 ? `${alertasPendientes} por revisar` : 'Todo tranquilo',
      detalle: sosActivo ? 'Revisa el mapa ahora' : 'Sin emergencias activas',
      alerta: sosActivo || alertasPendientes > 0,
      a: '/alertas',
    },
    {
      icono: '📞',
      titulo: 'Comunicación',
      valor: 'Llamar al reloj',
      detalle: `Habla directamente con ${nombre}`,
      alerta: false,
      a: '/comunicacion',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold">¿Cómo está {nombre} ahora?</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Todo lo importante, de un vistazo.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tarjetas.map((t) => (
          <Link
            key={t.titulo}
            to={t.a}
            className={`rounded-3xl border-2 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 ${
              t.alerta
                ? 'border-amber-300 dark:border-amber-700'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="text-4xl">{t.icono}</div>
            <div className="mt-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {t.titulo}
            </div>
            <div className="mt-1 text-2xl font-bold">{t.valor}</div>
            <div
              className={`mt-1 text-[15px] ${
                t.alerta ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {t.detalle}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
