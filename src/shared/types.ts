// Tipos compartidos entre el panel y el simulador de reloj.
// En Fase 2 esta carpeta se promueve a packages/shared del monorepo.

export const DEMO_DEVICE_ID = '00000000-0000-4000-8000-000000000001';

export type WearerGroup =
  | 'niño'
  | 'adulto mayor'
  | 'alzheimer'
  | 'tea'
  | 'discapacidad'
  | 'mascota';

export interface Device {
  id: string;
  name: string;
  wearer_name: string;
  wearer_age: number | null;
  wearer_group: WearerGroup;
  photo_url: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  created_at: string;
}

export type DeviceStatus = 'ok' | 'sos';

export interface Telemetry {
  id: number;
  device_id: string;
  lat: number;
  lng: number;
  speed_kmh: number;
  heart_rate: number;
  battery: number;
  signal: number;
  status: DeviceStatus;
  recorded_at: string;
}

/** Lo que envía el reloj en cada latido de datos (sin campos generados) */
export type TelemetryInput = Omit<Telemetry, 'id' | 'recorded_at'>;

export type ZoneKind = 'safe' | 'risk';

export interface Zone {
  id: string;
  device_id: string;
  name: string;
  kind: ZoneKind;
  icon: string;
  lat: number;
  lng: number;
  radius_m: number;
  created_at: string;
}

export type EventType =
  | 'sos'
  | 'fall'
  | 'hr_high'
  | 'hr_low'
  | 'zone_enter'
  | 'zone_exit'
  | 'battery_low'
  | 'offline'
  | 'info';

export interface AlertEvent {
  id: number;
  device_id: string;
  type: EventType;
  message: string;
  lat: number | null;
  lng: number | null;
  acknowledged: boolean;
  created_at: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}
