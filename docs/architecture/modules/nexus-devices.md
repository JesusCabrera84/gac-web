# Módulo: Nexus Devices

## 📌 Descripción
Gestión completa de dispositivos GPS.
Permite crear, listar, editar, actualizar estado, consultar eventos y comunicaciones de dispositivos.

---

## 👤 Actor
- Usuario autenticado con acceso a Nexus
- Rol: user / admin

---

## 🔌 APIs Consumidas

### 🔹 SISCOM Admin API (Gestión de dispositivos)

| Endpoint | Método | Uso |
|--------|--------|-----|
| /api/v1/devices/ | GET | Listar dispositivos con filtros |
| /api/v1/devices/ | POST | Crear nuevo dispositivo |
| /api/v1/devices/{id} | GET | Obtener detalles de un dispositivo |
| /api/v1/devices/{id} | PATCH | Actualizar dispositivo |
| /api/v1/devices/{id}/status | PATCH | Actualizar estado del dispositivo |
| /api/v1/devices/{id}/events | GET | Obtener historial de eventos |

---

### 🔹 SISCOM API (Datos en tiempo real)

| Endpoint | Método | Uso |
|--------|--------|-----|
| /api/v1/devices/{id}/communications/latest | GET | Última comunicación del dispositivo |
| /api/v1/devices/{id}/communications | GET | Historial de comunicaciones |

**Parámetros de consulta (GET /communications):**
- `received_at`: Fecha en formato YYYY-MM-DD
- `tz`: Zona horaria

---

### 🔹 WebSocket (Streaming en tiempo real)

| Endpoint | Protocolo | Uso |
|--------|--------|-----|
| /api/v1/stream?device_ids={ids} | WebSocket | Stream de datos de dispositivos en tiempo real |

**Formato de device_ids:** Puede ser un ID único o múltiples separados por coma.

---

## 🔁 Flujo funcional

### Listar Dispositivos
1. Usuario accede a `/products/nexus/devices`
2. Se obtiene lista vía `GET /devices/`
3. Se renderiza tabla con dispositivos
4. Se permite filtrado por cliente, estado, etc.

### Crear Dispositivo
1. Usuario hace clic en "Nuevo Dispositivo"
2. Completa formulario con:
   - IMEI
   - Modelo
   - Cliente asignado
   - Configuración inicial
3. Se envía `POST /devices/` con payload JSON
4. Se redirige a detalle del dispositivo

### Ver Detalle de Dispositivo
1. Usuario selecciona dispositivo
2. Se navega a `/products/nexus/devices/{id}`
3. Se obtienen datos en paralelo:
   - `GET /devices/{id}` → Detalles del dispositivo
   - `GET /devices/{id}/communications/latest` → Última comunicación
   - `GET /devices/{id}/events` → Historial de eventos
4. Se renderiza vista con mapa y datos

### Actualizar Estado
1. Usuario cambia estado del dispositivo
2. Se envía `PATCH /devices/{id}/status` con:
   - `new_status`: Nuevo estado
   - `client_id`: Cliente (opcional)
   - `unit_id`: Unidad (opcional)
   - `notes`: Notas (opcional)
3. Se actualiza vista

### Stream en Tiempo Real
1. Usuario abre vista de monitoreo
2. Se establece conexión WebSocket a `/stream?device_ids={ids}`
3. Se reciben actualizaciones en tiempo real
4. Se actualiza mapa y métricas automáticamente
5. Al cerrar vista, se cierra WebSocket

---

## ⚠️ Consideraciones
- Requiere token PASETO válido
- WebSocket se cierra automáticamente al cambiar de vista
- Las comunicaciones históricas pueden ser pesadas (usar paginación)
- El IMEI debe ser único en el sistema
- Los estados posibles dependen del flujo de negocio
- La última comunicación puede ser null si el dispositivo nunca reportó

---

## 🧭 Relación C4 (preview)

- **Container:** Web App (Svelte)
- **Consumes:** 
  - SISCOM Admin API (gestión de dispositivos)
  - SISCOM API (comunicaciones en tiempo real)
  - WebSocket (streaming)
- **Component:** Nexus Devices Module (`/routes/products/nexus/devices/`)
- **Related:** Nexus Commands (para enviar comandos a dispositivos)
