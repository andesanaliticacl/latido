# Roadmap — LATIDO

## Fase 1 · MVP demostrable  ← estamos aquí
El teléfono actúa como reloj; el panel muestra todo en tiempo real.
- Épicas E1–E8
- Demo: computador + celular en la misma red
- **1.1:** Supabase Auth + RLS por familia, deploy público (Vercel) para demo sin túnel

## Fase 2 · Integración reloj físico
- Gateway Node.js que traduce el protocolo del reloj GPS (TCP/UDP binario) a las mismas tablas de Supabase
- El panel no cambia: la fuente de datos es transparente
- App móvil para la familia (Capacitor/React Native reutilizando componentes) — aquí nace el monorepo `apps/* + packages/shared`
- Provisioning de dispositivos (vincular reloj por código QR)

## Fase 3 · Alertas inteligentes
- Motor de reglas server-side (Supabase Edge Functions): la detección deja de vivir en el dispositivo
- Notificaciones push / WhatsApp / SMS a contactos de emergencia
- Escalamiento: si nadie reconoce el SOS en N minutos, avisar al siguiente contacto
- Rutinas esperadas ("los martes sale del colegio a las 16:00")

## Fase 4 · IA predictiva
- Detección de anomalías en patrones de movimiento y pulso (modelo sobre histórico)
- Predicción de deambulación (Alzheimer): aviso antes de que salga de zona
- Resumen diario en lenguaje natural para la familia

## Fase 5 · Multi-organización
- Cuentas B2B: colegios, residencias de adultos mayores, municipalidades
- Panel multi-dispositivo con vista de flota
- Roles y permisos (administrador, cuidador, solo lectura)
- Facturación por dispositivo (SaaS)
