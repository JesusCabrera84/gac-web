# Módulo: Nexus Trips

## 📌 Descripción

Consulta y análisis de viajes realizados por dispositivos GPS.
Permite listar viajes, ver detalles con puntos GPS, alertas y eventos.

---

## 👤 Actor

- Usuario autenticado con acceso a Nexus
- Rol: user / admin

---

## 🔌 APIs Consumidas

### 🔹 SISCOM Admin API (Gestión de viajes)

| Endpoint                | Método | Uso                          |
| ----------------------- | ------ | ---------------------------- |
| /api/v1/trips           | GET    | Listar viajes con filtros    |
| /api/v1/trips/{trip_id} | GET    | Obtener detalles de un viaje |

**Parámetros de consulta (GET /trips):**

- `device_id`: Filtrar por dispositivo
- `day`: Fecha en formato YYYY-MM-DD
- `tz`: Zona horaria
- `limit`: Número máximo de resultados

**Parámetros de consulta (GET /trips/{trip_id}):**

- `include_alerts`: Incluir alertas del viaje (boolean)
- `include_points`: Incluir puntos GPS del viaje (boolean)
- `include_events`: Incluir eventos del viaje (boolean)

---

## 🔁 Flujo funcional

### Listar Viajes de un Dispositivo

1. Usuario accede a vista de dispositivo
2. Selecciona pestaña "Viajes"
3. Selecciona fecha y zona horaria
4. Se obtiene lista vía `GET /trips?device_id={id}&day={date}&tz={tz}`
5. Se renderiza lista de viajes con:
   - Hora de inicio
   - Hora de fin
   - Duración
   - Distancia recorrida
   - Origen y destino

### Ver Detalle de Viaje

1. Usuario hace clic en un viaje
2. Se obtiene detalle vía `GET /trips/{trip_id}?include_points=true&include_alerts=true&include_events=true`
3. Se renderiza mapa con:
   - Ruta completa (puntos GPS)
   - Marcadores de inicio/fin
   - Alertas en el recorrido
   - Eventos especiales
4. Se muestra timeline de eventos
5. Se muestran estadísticas del viaje

### Análisis de Viajes

1. Usuario selecciona rango de fechas
2. Se obtienen múltiples viajes
3. Se calculan métricas agregadas:
   - Total de viajes
   - Distancia total
   - Tiempo total en movimiento
   - Velocidad promedio
4. Se generan gráficas (cliente)

---

## ⚠️ Consideraciones

- Requiere token PASETO válido
- Los viajes se calculan en base a eventos de ignición ON/OFF
- La inclusión de puntos GPS puede generar respuestas muy grandes
- Se recomienda usar paginación para rangos de fechas amplios
- La zona horaria afecta la agrupación de viajes por día
- Los viajes sin puntos GPS no se pueden visualizar en mapa
- Las alertas incluyen: exceso de velocidad, geocercas, etc.

---

## 🧭 Relación C4 (preview)

- **Container:** Web App (Svelte)
- **Consumes:** SISCOM Admin API (viajes)
- **Component:** Nexus Trips Module
- **Related:**
  - Nexus Devices (para seleccionar dispositivo)
  - Map Engine (para renderizar rutas)
