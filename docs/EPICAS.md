# Épicas — LATIDO

Prioridades: 🔴 crítica · 🟠 alta · 🟡 media · 🟢 futura

---

## E1 — Telemetría en tiempo real 🔴

**Objetivo:** el teléfono (simulando el reloj) transmite su estado y el panel lo refleja en menos de 2 segundos.

**Historias de usuario**
- Como madre, quiero ver la ubicación de mi hijo moverse en el mapa en vivo, para saber que va camino al colegio.
- Como cuidador, quiero ver pulso, batería, velocidad y señal actualizados, para confirmar que todo está bien de un vistazo.
- Como familiar, quiero saber si el reloj está en línea o sin conexión, para no confiar en datos viejos.

**Criterios de aceptación**
- [ ] El simulador envía telemetría cada ≤ 5 s con GPS real del teléfono.
- [ ] El panel actualiza mapa y tarjetas sin recargar la página.
- [ ] Si no llegan datos por 20 s, el panel marca "Sin conexión".
- [ ] El recorrido del día se dibuja como línea sobre el mapa.

**Dependencias:** esquema Supabase + Realtime habilitado.

---

## E2 — Emergencias (SOS y caídas) 🔴

**Objetivo:** una emergencia es imposible de no ver.

**Historias de usuario**
- Como persona protegida, quiero un botón SOS gigante, para pedir ayuda con un solo toque.
- Como familiar, quiero que un SOS aparezca al instante con ubicación, para reaccionar sin buscar.
- Como familiar, quiero reconocer ("ya lo vi, voy en camino") una alerta, para que el resto de la familia sepa que está siendo atendida.

**Criterios de aceptación**
- [ ] SOS presionado → banner rojo global en el panel en < 2 s, con posición en el mapa.
- [ ] Caída simulada genera alerta diferenciada.
- [ ] Las alertas quedan en el centro de alertas hasta ser reconocidas.

**Dependencias:** E1.

---

## E3 — Zonas seguras 🔴

**Objetivo:** la familia define lugares de confianza y se entera de entradas y salidas.

**Historias de usuario**
- Como familiar, quiero crear zonas ("Casa", "Colegio", "Casa abuelos") tocando el mapa, para no ingresar coordenadas.
- Como familiar, quiero recibir un evento al entrar/salir de una zona, para saber que llegó bien.
- Como familiar, quiero marcar zonas de riesgo, para enterarme si se acerca a lugares peligrosos.

**Criterios de aceptación**
- [ ] Crear zona = clic en el mapa + nombre + radio con slider + tipo (segura/riesgo).
- [ ] Zonas visibles en el mapa del dashboard (verde = segura, rojo suave = riesgo).
- [ ] Entrada/salida genera evento en tiempo real y aparece en historial y alertas.

**Dependencias:** E1.

---

## E4 — Signos vitales y alertas de salud 🟠

**Objetivo:** el pulso cuenta una historia comprensible, no un gráfico médico.

**Historias de usuario**
- Como cuidador de un adulto mayor, quiero ver el pulso actual y su tendencia, para detectar anomalías.
- Como familiar, quiero alertas de pulso muy alto o muy bajo, sin tener que mirar el panel todo el día.
- Como familiar, quiero aviso de batería baja, para recordarle cargar el reloj.

**Criterios de aceptación**
- [ ] Slider de pulso en el simulador → tarjeta y mini-gráfico del panel se actualizan en vivo.
- [ ] Pulso > 120 o < 45 genera alerta (con histéresis: una vez por cruce, no en cada envío).
- [ ] Batería < 20 % genera alerta una sola vez.

**Dependencias:** E1.

---

## E5 — Historial humano 🟠

**Objetivo:** el día de la persona contado como una historia, no como logs.

**Historias de usuario**
- Como familiar, quiero un timeline con iconos ("09:10 llegó al colegio"), para revisar el día en 10 segundos.

**Criterios de aceptación**
- [ ] Timeline vertical con hora, icono y descripción; agrupado por día.
- [ ] Cero tablas. Eventos de emergencia destacados en color.

**Dependencias:** E2, E3, E4.

---

## E6 — Comunicación (interfaz) 🟡

**Objetivo:** interfaz de llamadas y escucha de entorno (solo UI en el MVP).

**Criterios de aceptación**
- [ ] Pantalla con "Llamar al reloj", "Escuchar entorno" y su historial simulado.
- [ ] Estados visuales de llamada (llamando → conectado → finalizada) simulados.

**Dependencias:** ninguna (UI pura).

---

## E7 — Control parental amigable 🟡

**Objetivo:** configurar el reloj con interruptores simples, no menús técnicos.

**Criterios de aceptación**
- [ ] Interruptores: horario escolar, modo descanso, modo emergencia.
- [ ] Lista de apps permitidas/bloqueadas con toggle por app.
- [ ] Resumen de tiempo de uso visual.

**Dependencias:** ninguna (local en el MVP).

---

## E8 — Perfil de la persona protegida 🟡

**Objetivo:** LATIDO cuida a una persona con nombre y cara, no a un "device_id".

**Criterios de aceptación**
- [ ] Foto, nombre, edad, grupo, contacto principal, dispositivo asociado y su estado.
- [ ] Nombre y contacto editables desde el panel.

**Dependencias:** esquema Supabase.

---

## E9 — Autenticación de familias 🟢 (Fase 1.1)

Supabase Auth con email/contraseña, políticas RLS por familia, invitaciones a otros cuidadores.

**Dependencias:** E1–E8 (endurece lo ya construido).
