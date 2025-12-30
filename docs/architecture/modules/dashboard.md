# Módulo: Dashboard

## 📌 Descripción
Vista principal del usuario.
Muestra estado general, métricas y accesos rápidos a módulos del sistema (Nexus, Usuarios).

---

## 👤 Actor
- Usuario autenticado
- Rol: user / admin

---

## 🔌 APIs Consumidas

### 🔹 SISCOM Admin API (Datos Nexus)

| Endpoint | Método | Uso |
|--------|--------|-----|
| /api/v1/devices/ | GET | Obtener lista de dispositivos |
| /api/v1/internal/clients/stats | GET | Estadísticas de clientes Nexus |

---

### 🔹 GAC API (Datos administrativos)

| Endpoint | Método | Uso |
|--------|--------|-----|
| /api/v1/users | GET | Obtener lista de usuarios internos |

---

## 🔁 Flujo funcional

1. Dashboard carga al iniciar sesión
2. Se realizan 3 llamadas en paralelo:
   - `DevicesService.getAll()` → Cuenta total de dispositivos
   - `ClientsService.getStats()` → Cuenta total de clientes
   - `userService.getUsers()` → Cuenta total de usuarios internos
3. Se muestran métricas en tarjetas (cards)
4. Se renderizan accesos rápidos a:
   - Nexus Devices
   - Admin Users
5. Se muestra actividad reciente (mock data)

---

## ⚠️ Consideraciones
- Depende de token JWT válido (GAC API)
- Depende de token PASETO válido (SISCOM Admin API)
- Las llamadas se realizan en paralelo para optimizar carga
- Si alguna API falla, se muestra 0 en la métrica correspondiente
- El reloj se actualiza cada segundo (cliente)

---

## 🧭 Relación C4 (preview)

- **Container:** Web App (Svelte)
- **Consumes:** 
  - SISCOM Admin API (dispositivos, clientes)
  - GAC API (usuarios)
- **Component:** Dashboard View (`/routes/+page.svelte`)
