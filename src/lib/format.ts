/** "hace 3 s", "hace 2 min", "hace 1 h" */
export function haceCuanto(iso: string): string {
  const seg = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seg < 60) return `hace ${seg} s`;
  const min = Math.round(seg / 60);
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} d`;
}

/** "09:10" */
export function horaCorta(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

/** "miércoles 16 de julio" */
export function fechaLarga(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/** Clave de agrupación por día: "2026-07-16" */
export function claveDia(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}
