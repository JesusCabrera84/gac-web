# Módulo: Admin Users

## 📌 Descripción

Gestión de usuarios internos del sistema GAC.
Permite crear, listar, editar y eliminar usuarios, así como asignar y revocar roles.

---

## 👤 Actor

- Administrador del sistema
- Rol: admin

---

## 🔌 APIs Consumidas

### 🔹 GAC API (Gestión de usuarios)

| Endpoint                                | Método | Uso                              |
| --------------------------------------- | ------ | -------------------------------- |
| /api/v1/users                           | GET    | Listar usuarios (con paginación) |
| /api/v1/users                           | POST   | Crear nuevo usuario              |
| /api/v1/users/{user_id}                 | GET    | Obtener detalles de un usuario   |
| /api/v1/users/{user_id}                 | PATCH  | Actualizar usuario               |
| /api/v1/users/{user_id}                 | DELETE | Eliminar usuario (soft delete)   |
| /api/v1/roles                           | GET    | Listar roles disponibles         |
| /api/v1/roles                           | POST   | Crear nuevo rol                  |
| /api/v1/users/{user_id}/roles/{role_id} | POST   | Asignar rol a usuario            |
| /api/v1/users/{user_id}/roles/{role_id} | DELETE | Revocar rol de usuario           |

---

## 🔁 Flujo funcional

### Listar Usuarios

1. Usuario admin accede a `/admin/internal-users`
2. Se obtiene lista de usuarios vía `GET /users?skip=0&limit=100`
3. Se renderiza tabla con usuarios
4. Se permite búsqueda y filtrado (cliente)

### Crear Usuario

1. Admin hace clic en "Nuevo Usuario"
2. Completa formulario con:
   - Email
   - Password
   - Full name
   - Roles (checkboxes)
   - Estado activo/inactivo
3. Se envía `POST /users` con payload JSON
4. Se redirige a lista de usuarios

### Editar Usuario

1. Admin selecciona usuario de la lista
2. Se carga detalle vía `GET /users/{id}`
3. Se muestra formulario pre-llenado
4. Admin modifica campos
5. Se envía `PATCH /users/{id}`
6. Se actualiza vista

### Gestión de Roles

1. Admin accede a sección de roles
2. Se listan roles vía `GET /roles`
3. Puede crear nuevos roles vía `POST /roles`
4. Puede asignar/revocar roles por usuario

---

## ⚠️ Consideraciones

- Requiere rol de administrador
- Las eliminaciones son soft deletes (no se borran físicamente)
- Los passwords deben cumplir política de seguridad
- Los roles se asignan/revocan de forma individual
- El email debe ser único en el sistema

---

## 🧭 Relación C4 (preview)

- **Container:** Web App (Svelte)
- **Consumes:** GAC API (gestión de usuarios y roles)
- **Component:** Admin Users Module (`/routes/admin/internal-users/`)
