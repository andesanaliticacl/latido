import { useEffect, useRef, useState } from 'react';
import {
  AdvancedMarker,
  Map as GoogleMap,
  useMap,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { Crosshair } from 'lucide-react';
import type { LatLng, Zone } from '../shared/types';
import { CENTRO_DEFECTO } from '../lib/geo';

interface Props {
  posicion: LatLng | null;
  recorrido?: LatLng[];
  zonas?: Zone[];
  sosActivo?: boolean;
  emojiPersona?: string;
  onClickMapa?: (pos: LatLng) => void;
  /** marcador provisional al crear una zona */
  zonaBorrador?: { pos: LatLng; radio: number; kind: 'safe' | 'risk' } | null;
}

/** Dibuja los círculos de zonas con la API imperativa de Google Maps */
function CirculosZonas({ zonas }: { zonas: Zone[] }) {
  const map = useMap();
  const circulos = useRef<google.maps.Circle[]>([]);
  useEffect(() => {
    if (!map) return;
    circulos.current.forEach((c) => c.setMap(null));
    circulos.current = zonas.map(
      (z) =>
        new google.maps.Circle({
          map,
          center: { lat: z.lat, lng: z.lng },
          radius: z.radius_m,
          strokeWeight: 2,
          strokeColor: z.kind === 'safe' ? '#10b981' : '#f43f5e',
          fillColor: z.kind === 'safe' ? '#10b981' : '#f43f5e',
          fillOpacity: 0.12,
          strokeOpacity: 0.7,
          clickable: false,
        }),
    );
    return () => circulos.current.forEach((c) => c.setMap(null));
  }, [map, zonas]);
  return null;
}

/** Círculo provisional mientras se crea una zona */
function CirculoBorrador({ pos, radio, kind }: { pos: LatLng; radio: number; kind: 'safe' | 'risk' }) {
  const map = useMap();
  const ref = useRef<google.maps.Circle | null>(null);
  useEffect(() => {
    if (!map) return;
    ref.current?.setMap(null);
    ref.current = new google.maps.Circle({
      map,
      center: pos,
      radius: radio,
      strokeWeight: 2,
      strokeColor: kind === 'safe' ? '#10b981' : '#f43f5e',
      strokeOpacity: 1,
      fillColor: kind === 'safe' ? '#10b981' : '#f43f5e',
      fillOpacity: 0.2,
      clickable: false,
    });
    return () => ref.current?.setMap(null);
  }, [map, pos, radio, kind]);
  return null;
}

/** Línea del recorrido del día */
function LineaRecorrido({ puntos }: { puntos: LatLng[] }) {
  const map = useMap();
  const ref = useRef<google.maps.Polyline | null>(null);
  useEffect(() => {
    if (!map) return;
    if (!ref.current) {
      ref.current = new google.maps.Polyline({
        map,
        strokeColor: '#3b82f6',
        strokeOpacity: 0.75,
        strokeWeight: 4,
      });
    }
    ref.current.setPath(puntos);
    return () => {
      ref.current?.setMap(null);
      ref.current = null;
    };
  }, [map]);
  useEffect(() => {
    ref.current?.setPath(puntos);
  }, [puntos]);
  return null;
}

/** Centra el mapa la primera vez que llega una posición real */
function AutoCentrar({ posicion }: { posicion: LatLng | null }) {
  const map = useMap();
  const [yaCentrado, setYaCentrado] = useState(false);
  useEffect(() => {
    if (!yaCentrado && posicion && map) {
      map.panTo(posicion);
      map.setZoom(16);
      setYaCentrado(true);
    }
  }, [posicion, yaCentrado, map]);
  return null;
}

/** Botón "centrar en el dispositivo" */
function BotonCentrar({ posicion }: { posicion: LatLng | null }) {
  const map = useMap();
  if (!posicion) return null;
  return (
    <button
      type="button"
      onClick={() => {
        map?.panTo(posicion);
        map?.setZoom(16);
      }}
      className="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg transition hover:bg-blue-50 dark:bg-slate-800 dark:text-slate-100"
      title="Centrar en el dispositivo"
      aria-label="Centrar en el dispositivo"
    >
      <Crosshair size={22} />
    </button>
  );
}

export function MapView({
  posicion,
  recorrido = [],
  zonas = [],
  sosActivo = false,
  emojiPersona = '🧒',
  onClickMapa,
  zonaBorrador = null,
}: Props) {
  const [centroInicial] = useState<LatLng>(() => posicion ?? CENTRO_DEFECTO);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <GoogleMap
        mapId="LATIDO_MAPA"
        defaultCenter={centroInicial}
        defaultZoom={15}
        gestureHandling="greedy"
        disableDefaultUI={false}
        streetViewControl={false}
        mapTypeControl={false}
        fullscreenControl={false}
        onClick={(e: MapMouseEvent) => {
          if (onClickMapa && e.detail.latLng) onClickMapa(e.detail.latLng);
        }}
        className="h-full w-full"
      >
        <AutoCentrar posicion={posicion} />
        <CirculosZonas zonas={zonas} />
        {zonaBorrador && (
          <CirculoBorrador
            pos={zonaBorrador.pos}
            radio={zonaBorrador.radio}
            kind={zonaBorrador.kind}
          />
        )}
        {recorrido.length > 1 && <LineaRecorrido puntos={recorrido} />}
        {posicion && (
          <AdvancedMarker position={posicion} title="Posición actual">
            <div className="relative">
              <span className="latido-pulse absolute inset-0" />
              <div
                className={`relative flex h-11 w-11 items-center justify-center rounded-full border-4 text-xl shadow-lg ${
                  sosActivo ? 'border-rose-500 bg-rose-100' : 'border-blue-500 bg-white'
                }`}
              >
                {emojiPersona}
              </div>
            </div>
          </AdvancedMarker>
        )}
        <BotonCentrar posicion={posicion} />
      </GoogleMap>
    </div>
  );
}
