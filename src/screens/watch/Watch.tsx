import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CENTRO_DEFECTO, zonasQueContienen } from '../../lib/geo';
import {
  DEMO_DEVICE_ID,
  type EventType,
  type LatLng,
  type Zone,
} from '../../shared/types';

/** Cada cuántos ms el reloj envía telemetría */
const INTERVALO_ENVIO_MS = 4000;

type ModoGps = 'esperando' | 'real' | 'virtual' | 'denegado';

interface EstadoReloj {
  pos: LatLng | null;
  velocidad: number; // km/h
  precision: number; // metros (para calidad de señal)
  pulso: number;
  bateria: number;
  sos: boolean;
}

export function Watch() {
  const [transmitiendo, setTransmitiendo] = useState(false);
  const [modoGps, setModoGps] = useState<ModoGps>('esperando');
  const [pulsoBase, setPulsoBase] = useState(78);
  const [pulsoActual, setPulsoActual] = useState(78);
  const [bateria, setBateria] = useState(85);
  const [bateriaReal, setBateriaReal] = useState(false);
  const [pos, setPos] = useState<LatLng | null>(null);
  const [velocidad, setVelocidad] = useState(0);
  const [enviados, setEnviados] = useState(0);
  const [ultimoError, setUltimoError] = useState<string | null>(null);
  const [sosEnviado, setSosEnviado] = useState(false);
  const [caidaEnviada, setCaidaEnviada] = useState(false);

  // Estado vivo para el intervalo de envío (evita closures viejos)
  const estado = useRef<EstadoReloj>({
    pos: null,
    velocidad: 0,
    precision: 20,
    pulso: 78,
    bateria: 85,
    sos: false,
  });
  const zonasRef = useRef<Zone[]>([]);
  const dentroDeRef = useRef<Set<string>>(new Set());
  const primeraDeteccionZonas = useRef(true);
  const avisoPulsoAlto = useRef(false);
  const avisoPulsoBajo = useRef(false);
  const avisoBateria = useRef(false);
  const avisoBateriaCritica = useRef(false);
  const watchId = useRef<number | null>(null);
  const virtualTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const registrarEvento = useCallback(
    async (type: EventType, message: string) => {
      const p = estado.current.pos;
      const { error } = await supabase.from('events').insert({
        device_id: DEMO_DEVICE_ID,
        type,
        message,
        lat: p?.lat ?? null,
        lng: p?.lng ?? null,
      });
      if (error) setUltimoError(error.message);
    },
    [],
  );

  // ── GPS real del teléfono ─────────────────────────────────
  const iniciarGpsReal = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setModoGps('denegado');
      return;
    }
    watchId.current = navigator.geolocation.watchPosition(
      (p) => {
        const nueva = { lat: p.coords.latitude, lng: p.coords.longitude };
        estado.current.pos = nueva;
        estado.current.velocidad = Math.max(0, (p.coords.speed ?? 0) * 3.6);
        estado.current.precision = p.coords.accuracy ?? 20;
        setPos(nueva);
        setVelocidad(estado.current.velocidad);
        setModoGps('real');
      },
      () => setModoGps((m) => (m === 'real' ? m : 'denegado')),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
    );
  }, []);

  // ── Paseo virtual (demo sin GPS o en escritorio) ──────────
  const iniciarPaseoVirtual = useCallback(() => {
    if (watchId.current != null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setModoGps('virtual');
    let rumbo = Math.random() * Math.PI * 2;
    if (!estado.current.pos) {
      estado.current.pos = { ...CENTRO_DEFECTO };
      setPos(estado.current.pos);
    }
    virtualTimer.current = setInterval(() => {
      rumbo += (Math.random() - 0.5) * 0.8;
      const paso = 0.00012; // ~13 m por tick: caminata rápida
      const actual = estado.current.pos ?? CENTRO_DEFECTO;
      const nueva = {
        lat: actual.lat + Math.cos(rumbo) * paso,
        lng: actual.lng + Math.sin(rumbo) * paso,
      };
      estado.current.pos = nueva;
      estado.current.velocidad = 4 + Math.random() * 3;
      estado.current.precision = 8;
      setPos(nueva);
      setVelocidad(estado.current.velocidad);
    }, 3000);
  }, []);

  // ── Batería real si el navegador la entrega ───────────────
  useEffect(() => {
    interface BateriaNavegador {
      level: number;
      addEventListener: (ev: string, cb: () => void) => void;
    }
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<BateriaNavegador>;
    };
    nav.getBattery?.().then((b) => {
      const aplicar = () => {
        const nivel = Math.round(b.level * 100);
        estado.current.bateria = nivel;
        setBateria(nivel);
        setBateriaReal(true);
      };
      aplicar();
      b.addEventListener('levelchange', aplicar);
    });
  }, []);

  // ── Pulso con variación natural alrededor del valor del slider ──
  useEffect(() => {
    const t = setInterval(() => {
      const jitter = Math.round((Math.random() - 0.5) * 6);
      const valor = Math.max(30, pulsoBase + jitter);
      estado.current.pulso = valor;
      setPulsoActual(valor);
    }, 2000);
    return () => clearInterval(t);
  }, [pulsoBase]);

  // ── Zonas: cargar y mantener actualizadas ─────────────────
  useEffect(() => {
    supabase
      .from('zones')
      .select('*')
      .eq('device_id', DEMO_DEVICE_ID)
      .then(({ data }) => {
        zonasRef.current = (data as Zone[]) ?? [];
      });
    const canal = supabase
      .channel('latido-watch-zonas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'zones' }, async () => {
        const { data } = await supabase
          .from('zones')
          .select('*')
          .eq('device_id', DEMO_DEVICE_ID);
        zonasRef.current = (data as Zone[]) ?? [];
      })
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  // ── El corazón del simulador: enviar telemetría ───────────
  useEffect(() => {
    if (!transmitiendo) return;
    const enviar = async () => {
      const s = estado.current;
      if (!s.pos) return;

      const senal = Math.max(10, Math.min(100, Math.round(110 - s.precision * 2)));
      const { error } = await supabase.from('telemetry').insert({
        device_id: DEMO_DEVICE_ID,
        lat: s.pos.lat,
        lng: s.pos.lng,
        speed_kmh: Math.round(s.velocidad * 10) / 10,
        heart_rate: s.pulso,
        battery: s.bateria,
        signal: senal,
        status: s.sos ? 'sos' : 'ok',
      });
      setUltimoError(error ? error.message : null);
      if (!error) setEnviados((n) => n + 1);

      // Detección de zonas (borde: solo al entrar/salir)
      const dentroAhora = new Set(
        zonasQueContienen(s.pos, zonasRef.current).map((z) => z.id),
      );
      if (!primeraDeteccionZonas.current) {
        for (const z of zonasRef.current) {
          const estaba = dentroDeRef.current.has(z.id);
          const esta = dentroAhora.has(z.id);
          if (!estaba && esta) {
            void registrarEvento(
              'zone_enter',
              z.kind === 'risk'
                ? `⚠️ Entró a la zona de riesgo «${z.name}»`
                : `Llegó a «${z.name}»`,
            );
          } else if (estaba && !esta) {
            void registrarEvento('zone_exit', `Salió de «${z.name}»`);
          }
        }
      }
      primeraDeteccionZonas.current = false;
      dentroDeRef.current = dentroAhora;

      // Umbrales de pulso (con histéresis simple)
      if (s.pulso > 120 && !avisoPulsoAlto.current) {
        avisoPulsoAlto.current = true;
        void registrarEvento('hr_high', `Frecuencia cardíaca elevada: ${s.pulso} lpm`);
      } else if (s.pulso < 110 && avisoPulsoAlto.current) {
        avisoPulsoAlto.current = false;
      }
      if (s.pulso < 45 && !avisoPulsoBajo.current) {
        avisoPulsoBajo.current = true;
        void registrarEvento('hr_low', `Frecuencia cardíaca muy baja: ${s.pulso} lpm`);
      } else if (s.pulso > 55 && avisoPulsoBajo.current) {
        avisoPulsoBajo.current = false;
      }

      // Batería baja y casi agotada (cada aviso una sola vez)
      if (s.bateria < 20 && !avisoBateria.current) {
        avisoBateria.current = true;
        void registrarEvento('battery_low', `Batería baja: ${s.bateria}%`);
      }
      if (s.bateria <= 10 && !avisoBateriaCritica.current) {
        avisoBateriaCritica.current = true;
        void registrarEvento(
          'battery_low',
          `🪫 Batería casi agotada: ${s.bateria}% — el reloj puede apagarse pronto`,
        );
      }
    };
    void enviar();
    const t = setInterval(enviar, INTERVALO_ENVIO_MS);
    return () => clearInterval(t);
  }, [transmitiendo, registrarEvento]);

  // Limpieza al desmontar
  useEffect(
    () => () => {
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
      if (virtualTimer.current) clearInterval(virtualTimer.current);
    },
    [],
  );

  const empezar = () => {
    setTransmitiendo(true);
    if (modoGps === 'esperando' || modoGps === 'denegado') iniciarGpsReal();
  };

  const presionarSos = async () => {
    estado.current.sos = true;
    setSosEnviado(true);
    await registrarEvento('sos', '🚨 ¡Presionó el botón SOS! Necesita ayuda ahora.');
    setTimeout(() => {
      estado.current.sos = false;
      setSosEnviado(false);
    }, 12000);
  };

  const simularCaida = async () => {
    setCaidaEnviada(true);
    await registrarEvento('fall', '🤕 Posible caída detectada por el sensor de movimiento.');
    setTimeout(() => setCaidaEnviada(false), 5000);
  };

  const ajustarBateria = (v: number) => {
    setBateriaReal(false);
    setBateria(v);
    estado.current.bateria = v;
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-4 bg-slate-950 px-5 py-6 text-slate-100">
      {/* Cabecera */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="animate-heartbeat text-2xl">💙</span>
          <div>
            <div className="font-extrabold tracking-tight text-blue-400">LATIDO Watch</div>
            <div className="text-xs text-slate-500">simulador de reloj · demo</div>
          </div>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
            transmitiendo ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              transmitiendo ? 'animate-pulse bg-emerald-400' : 'bg-slate-500'
            }`}
          />
          {transmitiendo ? 'Transmitiendo' : 'Detenido'}
        </span>
      </header>

      {/* Estado GPS */}
      <div className="rounded-2xl bg-slate-900 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">🛰 GPS</span>
          <span className="font-semibold">
            {modoGps === 'real' && '📍 Ubicación real del teléfono'}
            {modoGps === 'virtual' && '🚶 Paseo virtual'}
            {modoGps === 'esperando' && 'Esperando…'}
            {modoGps === 'denegado' && '❌ Sin permiso de ubicación'}
          </span>
        </div>
        {pos && (
          <div className="mt-1 text-xs text-slate-500">
            {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)} · {velocidad.toFixed(1)} km/h
          </div>
        )}
        {modoGps === 'denegado' && (
          <p className="mt-2 text-xs text-amber-400">
            Activa el permiso de ubicación o usa el paseo virtual para la demo.
          </p>
        )}
        <button
          type="button"
          onClick={modoGps === 'virtual' ? iniciarGpsReal : iniciarPaseoVirtual}
          className="mt-3 w-full rounded-xl bg-slate-800 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
        >
          {modoGps === 'virtual' ? 'Usar GPS real' : 'Usar paseo virtual (demo sin moverse)'}
        </button>
      </div>

      {/* Pulso */}
      <div className="rounded-2xl bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Frecuencia cardíaca simulada</span>
          <span className="flex items-center gap-2 text-2xl font-bold">
            <span className="animate-heartbeat inline-block">❤️</span>
            {pulsoActual}
            <span className="text-sm font-normal text-slate-500">lpm</span>
          </span>
        </div>
        <input
          type="range"
          min={35}
          max={180}
          value={pulsoBase}
          onChange={(e) => setPulsoBase(Number(e.target.value))}
          className="mt-3 w-full accent-rose-500"
          aria-label="Frecuencia cardíaca simulada"
        />
        <div className="mt-1 flex justify-between text-[11px] text-slate-500">
          <span>35 · muy bajo</span>
          <span>normal</span>
          <span>180 · muy alto</span>
        </div>
      </div>

      {/* Batería */}
      <div className="rounded-2xl bg-slate-900 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            🔋 Batería {bateriaReal ? '(real del teléfono)' : '(simulada)'}
          </span>
          <span className="text-xl font-bold">{bateria}%</span>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={bateria}
          onChange={(e) => ajustarBateria(Number(e.target.value))}
          className="mt-3 w-full accent-emerald-500"
          aria-label="Nivel de batería"
        />
      </div>

      {/* Botón principal */}
      {!transmitiendo ? (
        <button
          type="button"
          onClick={empezar}
          className="rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-blue-500"
        >
          ▶ Empezar a transmitir
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setTransmitiendo(false)}
          className="rounded-2xl bg-slate-800 py-3 font-semibold text-slate-300 transition hover:bg-slate-700"
        >
          ⏸ Pausar transmisión
        </button>
      )}

      {/* SOS */}
      <button
        type="button"
        onClick={presionarSos}
        disabled={sosEnviado}
        className={`rounded-3xl py-8 text-3xl font-black tracking-wide text-white shadow-xl transition ${
          sosEnviado
            ? 'animate-pulse bg-rose-700'
            : 'bg-rose-600 hover:bg-rose-500 active:scale-95'
        }`}
      >
        {sosEnviado ? '🚨 SOS ENVIADO' : '🚨 SOS'}
      </button>

      <button
        type="button"
        onClick={simularCaida}
        disabled={caidaEnviada}
        className={`rounded-2xl border-2 py-3.5 font-bold transition ${
          caidaEnviada
            ? 'border-amber-500 bg-amber-950 text-amber-300'
            : 'border-slate-700 text-slate-300 hover:border-amber-600 hover:text-amber-400'
        }`}
      >
        {caidaEnviada ? '🤕 Caída notificada' : '🤕 Simular caída'}
      </button>

      {/* Pie de estado */}
      <footer className="mt-auto rounded-2xl bg-slate-900 p-3 text-center text-xs text-slate-500">
        {ultimoError ? (
          <span className="text-rose-400">⚠️ {ultimoError}</span>
        ) : (
          <span>
            {enviados} envíos · cada {INTERVALO_ENVIO_MS / 1000} s · dispositivo demo
          </span>
        )}
      </footer>
    </div>
  );
}
