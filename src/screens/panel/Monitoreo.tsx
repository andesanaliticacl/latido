import { Link } from 'react-router-dom';
import { useLatido } from '../../state/LatidoStore';
import { haceCuanto } from '../../lib/format';
import { zonasQueContienen } from '../../lib/geo';

/** Centro de monitoreo: tarjetas grandes, lenguaje humano, cero tablas */
export function Monitoreo() {
  const { ultima, zonas, enLinea, sosActivo, device, eventos } = useLatido();
  const posicion = ultima ? { lat: ultima.lat, lng: ultima.lng } : null;
  const zonaActual = posicion ? zonasQueContienen(posicion, zonas)[0] : undefined;
  const alertasPendientes = eventos.filter((e) => !e.acknowledged && e.type !== 'info').length;
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
      valor: zonaActual ? `${zonaActual.icon} ${zonaActual.name}` : posicion ? 'En movimiento' : 'Sin datos',
      detalle: zonaActual
        ? zonaActual.kind === 'safe'
          ? 'Está en una zona segura'
          : '⚠️ Está en una zona de riesgo'
        : 'Fuera de zonas conocidas',
      alerta: zonaActual?.kind === 'risk',
      a: '/',
    },
    {
      icono: '🔋',
      titulo: 'Batería',
      valor: ultima ? `${ultima.battery}%` : 'Sin datos',
      detalle: ultima && ultima.battery < 20 ? 'Recuérdale cargar el reloj' : 'Batería suficiente',
      alerta: Boolean(ultima && ultima.battery < 20),
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
