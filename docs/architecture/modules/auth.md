# Módulo: Auth

## 📌 Descripción

Módulo de autenticación y autorización.
Gestiona el login de usuarios, renovación de tokens y obtención de perfil del usuario autenticado.

---

## 👤 Actor

- Usuario del sistema (admin/user)
- Servicios internos (para autenticación inter-servicios)

---

## 🔌 APIs Consumidas

### 🔹 GAC API (Autenticación de usuarios)

| Endpoint             | Método | Uso                                    |
| -------------------- | ------ | -------------------------------------- |
| /api/v1/auth/login   | POST   | Login con email y password (form-data) |
| /api/v1/auth/refresh | POST   | Renovar access token con refresh_token |
| /api/v1/auth/me      | GET    | Obtener perfil del usuario autenticado |

---

### 🔹 SISCOM Admin API (Autenticación interna)

| Endpoint              | Método | Uso                                       |
| --------------------- | ------ | ----------------------------------------- |
| /api/v1/auth/internal | POST   | Obtener token PASETO para servicios Nexus |

**Payload para token interno:**

```json
{
	"email": "user@example.com",
	"service": "gac",
	"role": "NEXUS_ADMIN",
	"expires_in_hours": 24
}
```

---

## 🔁 Flujo funcional

### Login de Usuario

1. Usuario ingresa credenciales en `/login`
2. Se envía POST a `/api/v1/auth/login` (GAC API)
3. Se recibe access_token y refresh_token
4. Tokens se almacenan en store de Svelte
5. Se redirige a dashboard

### Obtención de Token Interno (PASETO)

1. Módulo Nexus requiere autenticación
2. Se obtiene email del usuario autenticado
3. Se solicita token PASETO a `/api/v1/auth/internal`
4. Token se cachea con expiración de 24h
5. Token se usa para llamadas a SISCOM Admin API

### Renovación de Token

1. Access token expira
2. Se envía refresh_token a `/api/v1/auth/refresh`
3. Se recibe nuevo access_token
4. Se actualiza en el store

---

## ⚠️ Consideraciones

- Los tokens JWT (GAC) y PASETO (SISCOM) son diferentes y no intercambiables
- El token PASETO se cachea en memoria para evitar llamadas repetidas
- Si el token PASETO expira, se renueva automáticamente
- El logout debe limpiar ambos tipos de tokens
- La autenticación interna requiere que el usuario tenga email registrado

---

## 🧭 Relación C4 (preview)

- **Container:** Web App (Svelte)
- **Consumes:**
  - GAC API (autenticación de usuarios)
  - SISCOM Admin API (autenticación inter-servicios)
- **Used by:** Todos los módulos que requieren autenticación
