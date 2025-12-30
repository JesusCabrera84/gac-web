# Módulo: Payments

## 📌 Descripción
Gestión de pagos y transacciones.
Permite crear pagos, consultar detalles y listar pagos por cliente.

---

## 👤 Actor
- Usuario autenticado
- Rol: user / admin

---

## 🔌 APIs Consumidas

### 🔹 GAC API (Gestión de pagos)

| Endpoint | Método | Uso |
|--------|--------|-----|
| /api/v1/payments | POST | Crear nuevo pago |
| /api/v1/payments/{payment_id} | GET | Obtener detalles de un pago |
| /api/v1/clients/{client_id}/payments | GET | Listar pagos de un cliente |

---

## 🔁 Flujo funcional

### Crear Pago
1. Usuario accede a módulo de pagos
2. Selecciona orden o cliente
3. Completa información de pago:
   - Monto
   - Método de pago (tarjeta, transferencia, efectivo)
   - Referencia
   - Notas
4. Se envía `POST /payments` con payload JSON
5. Se genera registro de pago
6. Se actualiza estado de orden (si aplica)

### Consultar Pago
1. Usuario busca pago por ID
2. Se obtiene detalle vía `GET /payments/{payment_id}`
3. Se muestra información completa:
   - Monto
   - Fecha
   - Método de pago
   - Estado (PENDING, COMPLETED, FAILED, REFUNDED)
   - Cliente
   - Orden relacionada
   - Comprobante (si existe)

### Listar Pagos de Cliente
1. Usuario accede a perfil de cliente
2. Se obtienen pagos vía `GET /clients/{client_id}/payments`
3. Se renderiza lista con:
   - Fecha
   - Monto
   - Método
   - Estado
   - Orden relacionada
4. Se calcula total pagado por cliente

---

## ⚠️ Consideraciones
- Requiere token JWT válido (GAC API)
- Los pagos tienen estados: PENDING, COMPLETED, FAILED, REFUNDED
- Los métodos de pago pueden requerir integración con pasarelas externas
- Los pagos están vinculados a órdenes (opcional)
- Se debe validar monto antes de procesar
- Los reembolsos generan nuevos registros de pago
- Los pagos completados no se pueden modificar
- Se recomienda almacenar comprobantes de pago

---

## 🧭 Relación C4 (preview)

- **Container:** Web App (Svelte)
- **Consumes:** GAC API (pagos)
- **Component:** Payments Module
- **Related:** 
  - Orders (para vincular pagos a órdenes)
  - Payment Gateways (Stripe, PayPal - futuro)
