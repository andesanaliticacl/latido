import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import {
  DEMO_DEVICE_ID,
  type AlertEvent,
  type Device,
  type LatLng,
  type Telemetry,
  type Zone,
} from '../shared/types';

/** Segundos sin telemetría tras los cuales el reloj se considera sin conexión */
const UMBRAL_OFFLINE_S = 20;
/** Cuántas telemetrías recientes se conservan para gráficos */
const MAX_RECIENTES = 80;
/** Cuántos puntos de recorrido se dibujan en el mapa */
const MAX_RECORRIDO = 500;

interface LatidoContexto {
  cargando: boolean;
  device: Device | null;
  ultima: Telemetry | null;
  recientes: Telemetry[];
  recorrido: LatLng[];
  zonas: Zone[];
  eventos: AlertEvent[];
  enLinea: boolean;
  sosActivo: boolean;
  reconocerEvento: (id: number) => Promise<void>;
  crearZona: (z: Omit<Zone, 'id' | 'created_at' | 'device_id'>) => Promise<void>;
  eliminarZona: (id: string) => Promise<void>;
  actualizarDispositivo: (cambios: Partial<Device>) => Promise<void>;
}

const Ctx = createContext<LatidoContexto | null>(null);

export function LatidoProvider({ children }: { children: ReactNode }) {
  const [cargando, setCargando] = useState(true);
  const [device, setDevice] = useState<Device | null>(null);
  const [recientes, setRecientes] = useState<Telemetry[]>([]);
  const [recorrido, setRecorrido] = useState<LatLng[]>([]);
  const [zonas, setZonas] = useState<Zone[]>([]);
  const [eventos, setEventos] = useState<AlertEvent[]>([]);
  const [ahora, setAhora] = useState(() => Date.now());

  // Carga inicial
  useEffect(() => {
    let activo = true;
    (async () => {
      const [dev, tele, zon, evs] = await Promise.all([
        supabase.from('devices').select('*').eq('id', DEMO_DEVICE_ID).maybeSingle(),
        supabase
          .from('telemetry')
          .select('*')
          .eq('device_id', DEMO_DEVICE_ID)
          .order('recorded_at', { ascending: false })
          .limit(MAX_RECORRIDO),
        supabase.from('zones').select('*').eq('device_id', DEMO_DEVICE_ID),
        supabase
          .from('events')
          .select('*')
          .eq('device_id', DEMO_DEVICE_ID)
          .order('created_at', { ascending: false })
          .limit(150),
      ]);
      if (!activo) return;
      setDevice((dev.data as Device) ?? null);
      const cronologico = ((tele.data as Telemetry[]) ?? []).reverse();
      setRecientes(cronologico.slice(-MAX_RECIENTES));
      setRecorrido(cronologico.map((t) => ({ lat: t.lat, lng: t.lng })));
      setZonas((zon.data as Zone[]) ?? []);
      setEventos((evs.data as AlertEvent[]) ?? []);
      setCargando(false);
    })();
    return () => {
      activo = false;
    };
  }, []);

  // Suscripción en tiempo real
  useEffect(() => {
    const canal = supabase
      .channel('latido-panel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telemetry',
          filter: `device_id=eq.${DEMO_DEVICE_ID}`,
        },
        (payload) => {
          const t = payload.new as Telemetry;
          setRecientes((prev) => [...prev.slice(-(MAX_RECIENTES - 1)), t]);
          setRecorrido((prev) => [
            ...prev.slice(-(MAX_RECORRIDO - 1)),
            { lat: t.lat, lng: t.lng },
          ]);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
          filter: `device_id=eq.${DEMO_DEVICE_ID}`,
        },
        (payload) => {
          const e = payload.new as AlertEvent;
          setEventos((prev) => (prev.some((x) => x.id === e.id) ? prev : [e, ...prev]));
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
          filter: `device_id=eq.${DEMO_DEVICE_ID}`,
        },
        (payload) => {
          const e = payload.new as AlertEvent;
          setEventos((prev) => prev.map((x) => (x.id === e.id ? e : x)));
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'zones' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const z = payload.new as Zone;
            setZonas((prev) => (prev.some((x) => x.id === z.id) ? prev : [...prev, z]));
          } else if (payload.eventType === 'DELETE') {
            const z = payload.old as Partial<Zone>;
            setZonas((prev) => prev.filter((x) => x.id !== z.id));
          } else if (payload.eventType === 'UPDATE') {
            const z = payload.new as Zone;
            setZonas((prev) => prev.map((x) => (x.id === z.id ? z : x)));
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  // Tick para derivar "en línea / sin conexión"
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  const ultima = recientes.length > 0 ? recientes[recientes.length - 1] : null;
  const enLinea = useMemo(
    () =>
      ultima != null &&
      ahora - new Date(ultima.recorded_at).getTime() < UMBRAL_OFFLINE_S * 1000,
    [ultima, ahora],
  );
  const sosActivo = useMemo(
    () => eventos.some((e) => e.type === 'sos' && !e.acknowledged),
    [eventos],
  );

  const reconocerEvento = useCallback(async (id: number) => {
    setEventos((prev) =>
      prev.map((e) => (e.id === id ? { ...e, acknowledged: true } : e)),
    );
    await supabase.from('events').update({ acknowledged: true }).eq('id', id);
  }, []);

  const crearZona = useCallback(
    async (z: Omit<Zone, 'id' | 'created_at' | 'device_id'>) => {
      const { data } = await supabase
        .from('zones')
        .insert({ ...z, device_id: DEMO_DEVICE_ID })
        .select()
        .single();
      if (data) {
        const nueva = data as Zone;
        setZonas((prev) => (prev.some((x) => x.id === nueva.id) ? prev : [...prev, nueva]));
      }
    },
    [],
  );

  const eliminarZona = useCallback(async (id: string) => {
    setZonas((prev) => prev.filter((z) => z.id !== id));
    await supabase.from('zones').delete().eq('id', id);
  }, []);

  const actualizarDispositivo = useCallback(
    async (cambios: Partial<Device>) => {
      setDevice((prev) => (prev ? { ...prev, ...cambios } : prev));
      await supabase.from('devices').update(cambios).eq('id', DEMO_DEVICE_ID);
    },
    [],
  );

  const valor: LatidoContexto = {
    cargando,
    device,
    ultima,
    recientes,
    recorrido,
    zonas,
    eventos,
    enLinea,
    sosActivo,
    reconocerEvento,
    crearZona,
    eliminarZona,
    actualizarDispositivo,
  };

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useLatido(): LatidoContexto {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLatido debe usarse dentro de <LatidoProvider>');
  return ctx;
}
