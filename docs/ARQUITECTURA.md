# Arquitectura — LATIDO

## 1. Visión general

```
┌─────────────────────┐         ┌──────────────────────┐
│  📱 Simulador reloj  │         │  💻 Panel de familia  │
│  (web móvil /watch) │         │  (web escritorio /)  │
│                     │         │                      │
│  GPS real           │         │  Mapa en vivo        │
│  Batería real       │         │  Signos vitales      │
│  Pulso simulado     │         │  Alertas             │
│  SOS / caída        │         │  Zonas seguras       │
└─────────┬───────────┘         └──────────▲───────────┘
          │ INSERT telemetría/eventos      │ Supabase Realtime
          │ (supabase-js)                  │ (postgres_changes)
          ▼                                │
┌──────────────────────────────────────────┴──────────┐
│                      SUPABASE                        │
│   Postgres (devices, telemetry, zones, events)       │
│   Realtime (difusión de INSERTs)                     │
│   Auth (Fase 1.1: login de familias)                 │
└──────────────────────────────────────────────────────┘
```

Decisión clave del MVP: **no hay servidor Node propio todavía.** El simulador y el panel hablan directo con Supabase mediante `supabase-js`. Un backend Node aparece en Fase 2, cuando el reloj físico necesite un gateway de protocolo (los relojes GPS suelen hablar TCP binario, no HTTPS). El panel no notará el cambio: la fuente de datos escribe en las mismas tablas.

## 2. Árbol de carpetas

```
latido/
├── docs/                      # Diseño de producto (este documento, épicas, roadmap)
├── supabase/
│   └── migrations/            # SQL versionado del esquema
├── src/
│   ├── shared/                # Tipos compartidos panel ↔ simulador (futuro package)
│   │   └── types.ts
│   ├── lib/
│   │   ├── supabase.ts        # Cliente único de Supabase
│   │   ├── geo.ts             # Haversine, detección de zonas
│   │   └── format.ts          # Fechas relativas, formatos
│   ├── state/
│   │   └── LatidoStore.tsx    # Estado global (Context + Realtime)
│   ├── components/            # Reutilizables: StatCard, Toggle, MapView...
│   ├── screens/               # Una carpeta = una pantalla del producto
│   │   ├── panel/             # Dashboard, Monitoreo, Historial, ...
│   │   └── watch/             # Simulador de reloj (móvil)
│   ├── App.tsx                # Router
│   ├── main.tsx
│   └── index.css              # Design tokens (paleta, tipografía, modo oscuro)
└── ...configs
```

Cuando en Fase 2 exista app nativa, `src/shared` se promueve a `packages/shared` en un monorepo pnpm sin reescribir nada.

## 3. Modelo de datos

```
devices ─────────< telemetry        (histórico de posiciones y signos)
   │
   ├──────────< zones               (zonas seguras / de riesgo)
   │
   └──────────< events              (SOS, caídas, entradas/salidas, batería...)
```

| Tabla | Qué guarda | Quién escribe | Quién lee |
|---|---|---|---|
| `devices` | El reloj y la persona protegida (nombre, edad, grupo, contacto, foto) | Panel | Panel |
| `telemetry` | Cada latido de datos: lat/lng, velocidad, pulso, batería, señal, estado | Simulador (cada ~4 s) | Panel (última + recorrido) |
| `zones` | Zonas circulares con nombre, tipo (`safe`/`risk`), centro y radio | Panel | Panel + Simulador |
| `events` | Eventos con tipo, mensaje, posición y `acknowledged` | Simulador (SOS, caída, pulso, zonas, batería) y Panel (reconocer) | Panel |

Tipos de evento: `sos · fall · hr_high · hr_low · zone_enter · zone_exit · battery_low · offline · info`.

**¿Dónde se detectan las cosas?** En el MVP, el *dispositivo* genera sus eventos (igual que lo hará el reloj físico): el simulador conoce las zonas, detecta entrada/salida, umbrales de pulso y batería baja, y escribe el evento. El panel solo escucha y muestra. En Fase 3 esta lógica sube a alertas inteligentes del lado servidor.

## 4. Estado global del panel

Un solo store (`LatidoStore`, React Context) que:

1. Al montar, carga: dispositivo demo, últimas ~200 telemetrías (recorrido), zonas, últimos 100 eventos.
2. Se suscribe a Supabase Realtime (`postgres_changes` INSERT en `telemetry` y `events`, todo cambio en `zones`).
3. Deriva estado: `enLinea` (última telemetría < 20 s), `sosActivo` (evento SOS sin reconocer), zona actual.
4. Expone acciones: `reconocerEvento`, `crearZona`, `eliminarZona`, `actualizarPerfil`.

Sin Redux ni librerías extra: un contexto tipado basta para un dispositivo. Escalar a N dispositivos = mapa `deviceId → estado` en el mismo store.

## 5. Flujo entre pantallas

```
                    ┌─────────────┐
   Sidebar fijo →  │  Dashboard  │ ← pantalla de inicio (mapa 70% + tarjetas)
                    ├─────────────┤
                    │  Monitoreo  │  tarjetas grandes y amigables
                    │  Historial  │  timeline visual del día
                    │ Comunicación│  llamadas simuladas
                    │   Control   │  interruptores parentales
                    │    Zonas    │  crear/editar zonas sobre el mapa
                    │   Alertas   │  centro de eventos + reconocer
                    │   Perfil    │  persona protegida y dispositivo
                    └─────────────┘

   /watch (celular) → pantalla única tipo reloj: estado, pulso, SOS, caída
```

Un SOS activo muestra un **banner rojo global** sobre cualquier pantalla, con acceso directo al mapa y a Alertas. La emergencia siempre gana.

## 6. Wireframes (texto)

### Dashboard
```
┌──────┬──────────────────────────────────────────┬─────────────┐
│ SIDE │  🔴 BANNER SOS (solo si hay emergencia)   │  ❤️ 78 lpm  │
│ BAR  │ ┌──────────────────────────────────────┐ │  🔋 82 %    │
│      │ │                                      │ │  🚶 4 km/h  │
│ 💙   │ │            MAPA  (70%)               │ │  🛰 Buena   │
│ Inicio│ │   ● posición   ─ recorrido           │ │  ⌚ En línea │
│ Monit.│ │   ◯ zonas seguras  ◯ zonas riesgo    │ │  🕐 hace 3 s│
│ Hist. │ │              [⌖ centrar]             │ ├─────────────┤
│ ...  │ └──────────────────────────────────────┘ │ Últimos     │
│      │                                          │ eventos ▸   │
└──────┴──────────────────────────────────────────┴─────────────┘
```

### Simulador /watch (celular)
```
┌───────────────────┐
│   LATIDO ⌚ demo   │
│  ● Transmitiendo  │
│                   │
│   ❤️  [====|--]   │  ← slider pulso
│   78 lpm          │
│                   │
│  ┌─────────────┐  │
│  │   🚨 SOS    │  │  ← botón gigante
│  └─────────────┘  │
│  [🤕 Simular caída]│
│  🔋 82%  🛰 GPS ok │
└───────────────────┘
```

(El resto de pantallas sigue el mismo lenguaje: tarjetas grandes, iconografía clara, cero tablas.)

## 7. Design tokens

- **Paleta:** azul calma `#3D7DD8` (confianza), verde `#2FA97C` (todo está bien), ámbar (atención), rojo coral (emergencia — solo emergencias), grises muy suaves, blanco.
- **Tipografía:** system-ui, tamaños base 16–18 px, títulos generosos. Pensada para adultos mayores.
- **Accesibilidad:** contraste AA+, botones ≥ 44 px, modo claro/oscuro persistente, estados comunicados con icono + color + texto (nunca solo color).

## 8. Seguridad (estado actual y deuda declarada)

- MVP demo: RLS activado con políticas abiertas a `anon` **solo para la demo** (documentado en la migración).
- Fase 1.1: Supabase Auth (email + password) y políticas por `family_id`.
- La clave `publishable` de Supabase y la key de Maps son públicas por diseño (viven en el navegador); la protección real es RLS + restricción de la key de Maps por dominio.
