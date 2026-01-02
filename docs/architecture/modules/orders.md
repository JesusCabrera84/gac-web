# Módulo: Orders

## 📌 Descripción

Gestión de órdenes de compra/servicio.
Permite crear órdenes, consultar detalles y listar órdenes por cliente.

---

## 👤 Actor

- Usuario autenticado
- Rol: user / admin

---

## 🔌 APIs Consumidas

### 🔹 GAC API (Gestión de órdenes)

| Endpoint                           | Método | Uso                           |
| ---------------------------------- | ------ | ----------------------------- |
| /api/v1/orders                     | POST   | Crear nueva orden             |
| /api/v1/orders/{order_id}          | GET    | Obtener detalles de una orden |
| /api/v1/clients/{client_id}/orders | GET    | Listar órdenes de un cliente  |

---

## 🔁 Flujo funcional

### Crear Orden

1. Usuario accede a módulo de órdenes
2. Hace clic en "Nueva Orden"
3. Completa formulario con:
   - Cliente
   - Productos/servicios
   - Cantidades
   - Precios
   - Información de entrega
4. Se envía `POST /orders` con payload JSON
5. Se genera orden con ID único
6. Se redirige a detalle de orden

### Consultar Orden

1. Usuario busca orden por ID
2. Se obtiene detalle vía `GET /orders/{order_id}`
3. Se muestra información completa:
   - Productos/servicios
   - Totales
   - Estado de la orden
   - Información de cliente
   - Historial de cambios

### Listar Órdenes de Cliente

1. Usuario accede a perfil de cliente
2. Se obtienen órdenes vía `GET /clients/{client_id}/orders`
3. Se renderiza lista con:
   - Número de orden
   - Fecha
   - Total
   - Estado
4. Se permite ordenar y filtrar

---

## ⚠️ Consideraciones

- Requiere token JWT válido (GAC API)
- Las órdenes pueden tener múltiples estados (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- Los totales se calculan en el servidor
- Las órdenes están vinculadas a clientes
- Se debe validar inventario antes de crear orden
- Los cambios de estado pueden generar notificaciones

---

## 🧭 Relación C4 (preview)

- **Container:** Web App (Svelte)
- **Consumes:** GAC API (órdenes)
- **Component:** Orders Module
- **Related:**
  - Products (para seleccionar productos)
  - Payments (para procesar pagos)
  - Shipments (para gestionar envíos)
