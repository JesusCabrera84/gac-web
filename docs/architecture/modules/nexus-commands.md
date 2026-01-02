# Módulo: Nexus Commands

## 📌 Descripción

Envío y gestión de comandos a dispositivos GPS.
Permite crear comandos, consultar historial por dispositivo y sincronizar estado con KORE.

---

## 👤 Actor

- Usuario autenticado con acceso a Nexus
- Rol: user / admin

---

## 🔌 APIs Consumidas

### 🔹 SISCOM Admin API (Gestión de comandos)

| Endpoint                            | Método | Uso                                     |
| ----------------------------------- | ------ | --------------------------------------- |
| /api/v1/commands                    | POST   | Crear nuevo comando                     |
| /api/v1/commands/device/{device_id} | GET    | Obtener comandos de un dispositivo      |
| /api/v1/commands/{command_id}/sync  | POST   | Sincronizar estado del comando con KORE |

**Parámetros de consulta (GET /commands/device/{device_id}):**

- `limit`: Número máximo de resultados
- `offset`: Desplazamiento para paginación
- `status_filter`: Filtrar por estado del comando

---

## 🔁 Flujo funcional

### Enviar Comando a Dispositivo

1. Usuario accede a vista de dispositivo
2. Selecciona comando desde panel de comandos
3. Completa parámetros del comando:
   - `device_id`: ID del dispositivo
   - `command`: Tipo de comando (ej: "LOCATE", "REBOOT")
   - `media`: Medio de envío (ej: "SMS", "GPRS")
4. Se envía `POST /commands` con payload JSON
5. Se muestra confirmación
6. Comando aparece en historial

### Consultar Historial de Comandos

1. Usuario accede a detalle de dispositivo
2. Se obtiene historial vía `GET /commands/device/{device_id}`
3. Se renderiza tabla con:
   - Comando enviado
   - Fecha/hora
   - Estado (PENDING, SENT, DELIVERED, FAILED)
   - Medio utilizado
4. Se permite filtrar por estado

### Sincronizar Estado con KORE

1. Usuario hace clic en "Sincronizar" en un comando
2. Se envía `POST /commands/{command_id}/sync`
3. Sistema consulta estado actual en KORE
4. Se actualiza estado del comando
5. Se muestra estado actualizado

---

## ⚠️ Consideraciones

- Requiere token PASETO válido
- Los comandos tienen ciclo de vida: PENDING → SENT → DELIVERED/FAILED
- La sincronización con KORE puede tardar varios segundos
- No todos los comandos están disponibles para todos los dispositivos
- El medio de envío (SMS/GPRS) depende de la conectividad del dispositivo
- Los comandos pueden fallar si el dispositivo está offline

---

## 🧭 Relación C4 (preview)

- **Container:** Web App (Svelte)
- **Consumes:** SISCOM Admin API (comandos)
- **Component:** Nexus Commands Module (`/lib/components/nexus/CommandPanel.svelte`)
- **Related:**
  - Nexus Devices (para seleccionar dispositivo)
  - KORE (sistema externo para delivery de comandos)
