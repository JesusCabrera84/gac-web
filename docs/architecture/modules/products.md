# Módulo: Products

## 📌 Descripción
Catálogo de productos y servicios.
Permite listar productos disponibles y crear nuevos productos en el sistema.

---

## 👤 Actor
- Usuario autenticado
- Rol: user / admin (admin para crear)

---

## 🔌 APIs Consumidas

### 🔹 GAC API (Catálogo de productos)

| Endpoint | Método | Uso |
|--------|--------|-----|
| /api/v1/products | GET | Listar todos los productos |
| /api/v1/products | POST | Crear nuevo producto |

---

## 🔁 Flujo funcional

### Listar Productos
1. Usuario accede a catálogo de productos
2. Se obtiene lista vía `GET /products`
3. Se renderiza catálogo con:
   - Nombre del producto
   - Descripción
   - Precio
   - Disponibilidad
   - Imagen (si existe)
4. Se permite búsqueda y filtrado (cliente)

### Crear Producto
1. Admin accede a gestión de productos
2. Hace clic en "Nuevo Producto"
3. Completa formulario con:
   - Nombre
   - Descripción
   - Precio
   - SKU
   - Categoría
   - Stock inicial
4. Se envía `POST /products` con payload JSON
5. Producto aparece en catálogo

### Seleccionar Producto para Orden
1. Usuario está creando una orden
2. Se muestra catálogo de productos
3. Usuario selecciona productos
4. Se agregan a la orden con cantidades

---

## ⚠️ Consideraciones
- Requiere token JWT válido (GAC API)
- Solo administradores pueden crear productos
- Los productos pueden estar activos o inactivos
- El precio puede variar según promociones (no implementado en API actual)
- El stock se actualiza automáticamente al crear órdenes
- Los productos pueden tener variantes (no implementado en API actual)

---

## 🧭 Relación C4 (preview)

- **Container:** Web App (Svelte)
- **Consumes:** GAC API (productos)
- **Component:** Products Module
- **Related:** 
  - Orders (para crear órdenes con productos)
  - Inventory (gestión de stock - futuro)
