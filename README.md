# 💙 LATIDO

**Plataforma de monitoreo inteligente para proteger a quienes más quieres.**

LATIDO conecta relojes inteligentes con las familias. No para controlar: para proteger vidas, entregar tranquilidad y responder rápido ante emergencias.

Protegemos a:

- 👧 Niños
- 👴 Adultos mayores
- 🧠 Personas con Alzheimer
- 💙 Personas dentro del espectro autista
- ♿ Personas con discapacidad
- 🐕 Mascotas

## El MVP en 30 segundos

1. Abres el **panel de monitoreo** en tu computador (`/`).
2. Abres el **simulador de reloj** en tu celular (`/watch`) — el navegador del teléfono actúa como el reloj: GPS real, batería real, pulso simulado, botón SOS.
3. Todo lo que pasa en el teléfono aparece **en tiempo real** en el panel: ubicación, recorrido, signos vitales, alertas y zonas seguras.

Cuando llegue el reloj físico (Fase 2), solo se reemplaza la fuente de datos. El panel no cambia.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite + TypeScript + TailwindCSS |
| Mapa | Google Maps API (`@vis.gl/react-google-maps`) |
| Base de datos / Realtime / Auth | Supabase |
| Simulador de reloj | Web móvil (Geolocation API + Battery API) |

## Cómo correr el proyecto

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env   # y completar con tus claves

# 3. Crear las tablas en Supabase
#    Pegar el contenido de supabase/migrations/0001_esquema_inicial.sql
#    en el SQL Editor de tu proyecto Supabase y ejecutar.

# 4. Levantar en modo desarrollo (HTTPS, accesible desde el celular)
npm run dev
```

El panel queda en `https://localhost:5173` y desde tu celular (misma red WiFi) abres `https://IP-DE-TU-PC:5173/watch`. El navegador mostrará una advertencia de certificado (es autofirmado, solo en desarrollo): tocar "Avanzado → Continuar". HTTPS es obligatorio para que el teléfono entregue el GPS.

## Documentación

- [Arquitectura](docs/ARQUITECTURA.md) — visión técnica, modelo de datos, árbol de carpetas, wireframes
- [Épicas](docs/EPICAS.md) — historias de usuario y criterios de aceptación
- [Roadmap](docs/ROADMAP.md) — las 5 fases del producto

## Flujo de trabajo Git

Git Flow: `main` (producción) ← `develop` ← `feature/*`. Nunca push directo a `main`; toda funcionalidad entra por Pull Request.
