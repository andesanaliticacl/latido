import type { LatLng, Zone } from '../shared/types';

/** Distancia en metros entre dos coordenadas (haversine) */
export function distanciaMetros(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Zonas que contienen la posición dada */
export function zonasQueContienen(pos: LatLng, zonas: Zone[]): Zone[] {
  return zonas.filter((z) => distanciaMetros(pos, z) <= z.radius_m);
}

/** Centro por defecto cuando aún no hay GPS (Plaza de Armas, Santiago) */
export const CENTRO_DEFECTO: LatLng = { lat: -33.4372, lng: -70.6506 };
