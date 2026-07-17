import {
  Bell,
  HeartPulse,
  History,
  LayoutDashboard,
  MapPinned,
  Phone,
  ToggleLeft,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  a: string;
  icono: LucideIcon;
  texto: string;
  textoCorto: string;
  exacto?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { a: '/', icono: LayoutDashboard, texto: 'Inicio', textoCorto: 'Inicio', exacto: true },
  { a: '/monitoreo', icono: HeartPulse, texto: 'Monitoreo', textoCorto: 'Monitoreo' },
  { a: '/historial', icono: History, texto: 'Historial', textoCorto: 'Historial' },
  { a: '/comunicacion', icono: Phone, texto: 'Comunicación', textoCorto: 'Llamar' },
  { a: '/zonas', icono: MapPinned, texto: 'Zonas seguras', textoCorto: 'Zonas' },
  { a: '/alertas', icono: Bell, texto: 'Alertas', textoCorto: 'Alertas' },
  { a: '/control', icono: ToggleLeft, texto: 'Control parental', textoCorto: 'Control' },
  { a: '/perfil', icono: UserRound, texto: 'Perfil', textoCorto: 'Perfil' },
];

/** Rutas que aparecen en la barra inferior del celular (el resto va en "Más") */
export const RUTAS_PRIMARIAS = ['/', '/monitoreo', '/zonas', '/alertas'];
