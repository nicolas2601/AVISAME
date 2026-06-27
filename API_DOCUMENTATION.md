# 🍽️ AvisameAccasoft - Documentación Completa de la API

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Acceso a la Documentación](#acceso-a-la-documentación)
3. [Endpoints Disponibles](#endpoints-disponibles)
4. [Flujo de Uso](#flujo-de-uso)
5. [Ejemplos en Postman](#ejemplos-en-postman)

---

## Descripción General

**AvisameAccasoft** es un sistema de gestión de restaurantes que permite a los clientes:
- Escanear códigos QR en las mesas
- Registrarse con su teléfono
- Solicitar mesero o la cuenta
- Ver el menú del restaurante

### Características Principales

✅ **Gestión de Restaurantes** - Crear y administrar restaurantes  
✅ **Menús Digitales** - Menús con categorías, precios y disponibilidad  
✅ **Mesas Inteligentes** - Códigos QR únicos por mesa  
✅ **Sistema de Solicitudes** - Llamar mesero, pedir cuenta, cancelar  
✅ **Verificación de Clientes** - Registro y verificación por SMS (mock)  
✅ **Sesiones de Mesa** - Seguimiento de clientes en mesas  

---

## Acceso a la Documentación

### 1. **Documentación JSON (Recomendado)**
```
GET http://localhost:8000/docs/
```

Esta URL devuelve toda la documentación en formato JSON, perfecta para importar en Postman.

### 2. **Importar en Postman**
1. Abre Postman
2. Click en **Import** (esquina superior izquierda)
3. Selecciona **Link**
4. Pega: `http://localhost:8000/docs/`
5. Click en **Import**

---

## Endpoints Disponibles

### 🏪 RESTAURANTES

#### Listar Restaurantes
```http
GET /api/restaurants/
```

**Respuesta:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "La Cosecha Colombiana",
    "address": "Carrera 7 #40-62, Bogotá, Colombia",
    "phone": "+57 1 123 4567",
    "email": "info@lacosechacol.com",
    "is_active": true,
    "created_at": "2025-12-06T09:00:00Z",
    "updated_at": "2025-12-06T09:00:00Z"
  }
]
```

#### Obtener Menú del Restaurante
```http
GET /api/restaurants/{restaurant_id}/menu/
```

**Parámetros:**
- `restaurant_id` (path): UUID del restaurante

**Respuesta:**
```json
{
  "restaurant_name": "La Cosecha Colombiana",
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Bandeja Paisa",
      "description": "Frijoles, arroz, carne molida, chicharrón, chorizo, aguacate, plátano, arepa y huevo",
      "price": "35000.00",
      "category_name": "Platos Típicos",
      "image_url": "http://localhost:8000/media/menu_items/bandeja.jpg",
      "is_available": true,
      "preparation_time": 30
    }
  ]
}
```

---

### 🪑 MESAS

#### Listar Mesas por Restaurante
```http
GET /api/tables/?restaurant={restaurant_id}
```

**Parámetros Query:**
- `restaurant`: UUID del restaurante

**Respuesta:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "restaurant": "550e8400-e29b-41d4-a716-446655440000",
    "restaurant_name": "La Cosecha Colombiana",
    "table_number": "1",
    "capacity": 4,
    "is_active": true,
    "qr_code": "550e8400-e29b-41d4-a716-446655440000:1",
    "qr_image_url": "http://localhost:8000/media/qr_codes/qr_1.png",
    "created_at": "2025-12-06T09:00:00Z",
    "updated_at": "2025-12-06T09:00:00Z"
  }
]
```

#### Solicitar Mesero
```http
POST /api/tables/{table_id}/request-waiter/
Content-Type: application/json

{
  "customer_id": "550e8400-e29b-41d4-a716-446655440003"
}
```

**Respuesta:**
```json
{
  "message": "Mesero solicitado",
  "request": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "session": "550e8400-e29b-41d4-a716-446655440005",
    "request_type": "call_waiter",
    "status": "pending",
    "notes": "",
    "created_at": "2025-12-06T09:15:00Z",
    "updated_at": "2025-12-06T09:15:00Z"
  },
  "session_id": "550e8400-e29b-41d4-a716-446655440005"
}
```

#### Solicitar Cuenta
```http
POST /api/tables/{table_id}/request-bill/
Content-Type: application/json

{
  "customer_id": "550e8400-e29b-41d4-a716-446655440003"
}
```

#### Cancelar Solicitud
```http
POST /api/tables/{table_id}/cancel-request/
Content-Type: application/json

{
  "customer_id": "550e8400-e29b-41d4-a716-446655440003"
}
```

**Respuesta:**
```json
{
  "message": "Solicitud cancelada",
  "has_active_session": true
}
```

#### Obtener Solicitud Activa
```http
GET /api/tables/{table_id}/active-request/?customer_id={customer_id}
```

**Parámetros:**
- `table_id` (path): UUID de la mesa
- `customer_id` (query): UUID del cliente (opcional)

**Respuesta:**
```json
{
  "has_active_request": true,
  "request": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "session": "550e8400-e29b-41d4-a716-446655440005",
    "request_type": "call_waiter",
    "status": "pending",
    "notes": "",
    "created_at": "2025-12-06T09:15:00Z",
    "updated_at": "2025-12-06T09:15:00Z"
  }
}
```

---

### 👤 CLIENTES

#### Registrar Cliente
```http
POST /api/customers/register/
Content-Type: application/json

{
  "full_name": "Juan Pérez",
  "phone_number": "3001234567"
}
```

**Respuesta:**
```json
{
  "message": "Código enviado",
  "customer_id": "550e8400-e29b-41d4-a716-446655440003",
  "phone_number": "3001234567",
  "verification_code": "123456"
}
```

⚠️ **Nota:** En desarrollo, el código se devuelve en la respuesta. En producción se enviaría por SMS.

#### Verificar Cliente
```http
POST /api/customers/verify/
Content-Type: application/json

{
  "phone_number": "3001234567",
  "verification_code": "123456"
}
```

**Respuesta:**
```json
{
  "message": "Teléfono verificado",
  "customer": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "full_name": "Juan Pérez",
    "phone_number": "3001234567",
    "phone_verified": true,
    "created_at": "2025-12-06T09:00:00Z",
    "updated_at": "2025-12-06T09:10:00Z"
  }
}
```

---

## Flujo de Uso

### Paso a Paso - Experiencia del Cliente

```
1. Cliente escanea QR de la mesa
   └─ Obtiene: restaurant_id:table_id

2. Cliente se registra
   POST /api/customers/register/
   {
     "full_name": "Juan Pérez",
     "phone_number": "3001234567"
   }
   └─ Recibe: customer_id y verification_code

3. Cliente verifica su teléfono
   POST /api/customers/verify/
   {
     "phone_number": "3001234567",
     "verification_code": "123456"
   }
   └─ Teléfono verificado ✓

4. Cliente solicita mesero
   POST /api/tables/{table_id}/request-waiter/
   {
     "customer_id": "550e8400-e29b-41d4-a716-446655440003"
   }
   └─ Mesero notificado

5. Cliente visualiza menú
   GET /api/restaurants/{restaurant_id}/menu/
   └─ Recibe lista de platos disponibles

6. Cliente solicita la cuenta
   POST /api/tables/{table_id}/request-bill/
   {
     "customer_id": "550e8400-e29b-41d4-a716-446655440003"
   }
   └─ Cuenta solicitada
```

---

## Ejemplos en Postman

### Colección Postman (JSON)

```json
{
  "info": {
    "name": "AvisameAccasoft API",
    "description": "Endpoints de la API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Restaurantes",
      "item": [
        {
          "name": "Listar Restaurantes",
          "request": {
            "method": "GET",
            "url": "http://localhost:8000/api/restaurants/"
          }
        },
        {
          "name": "Obtener Menú",
          "request": {
            "method": "GET",
            "url": "http://localhost:8000/api/restaurants/{{restaurant_id}}/menu/"
          }
        }
      ]
    },
    {
      "name": "Mesas",
      "item": [
        {
          "name": "Listar Mesas",
          "request": {
            "method": "GET",
            "url": "http://localhost:8000/api/tables/?restaurant={{restaurant_id}}"
          }
        },
        {
          "name": "Solicitar Mesero",
          "request": {
            "method": "POST",
            "url": "http://localhost:8000/api/tables/{{table_id}}/request-waiter/",
            "body": {
              "mode": "raw",
              "raw": "{\"customer_id\": \"{{customer_id}}\"}"
            }
          }
        }
      ]
    },
    {
      "name": "Clientes",
      "item": [
        {
          "name": "Registrar Cliente",
          "request": {
            "method": "POST",
            "url": "http://localhost:8000/api/customers/register/",
            "body": {
              "mode": "raw",
              "raw": "{\"full_name\": \"Juan Pérez\", \"phone_number\": \"3001234567\"}"
            }
          }
        },
        {
          "name": "Verificar Cliente",
          "request": {
            "method": "POST",
            "url": "http://localhost:8000/api/customers/verify/",
            "body": {
              "mode": "raw",
              "raw": "{\"phone_number\": \"3001234567\", \"verification_code\": \"123456\"}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## 🚀 Cómo Empezar

### 1. Iniciar el servidor
```bash
cd backend
uv run python manage.py runserver
```

### 2. Crear datos de prueba
```bash
uv run python manage.py seed_data
```

### 3. Acceder a la documentación
```
http://localhost:8000/docs/
```

### 4. Importar en Postman
- Abre Postman
- Import → Link → `http://localhost:8000/docs/`

---

## 📊 Estructura de Datos

### UUID
Identificador único universal
```
Ejemplo: 550e8400-e29b-41d4-a716-446655440000
```

### DateTime
Formato ISO 8601
```
Ejemplo: 2025-12-06T09:00:00Z
```

### Decimal
Números con decimales (precios)
```
Ejemplo: 35000.00
```

---

## ❌ Códigos de Error

| Código | Significado |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Server Error - Error del servidor |

---

## 💡 Notas Importantes

- ✅ La documentación está disponible en `/docs/` en formato JSON
- ✅ Todos los IDs son UUIDs
- ✅ Los códigos de verificación en desarrollo se devuelven en la respuesta
- ✅ Los códigos QR se generan automáticamente al crear mesas
- ✅ Las sesiones se crean automáticamente al hacer la primera solicitud

---

## 📞 Soporte

Para más información o reportar problemas, contacta al equipo de desarrollo.

**¡Disfruta usando AvisameAccasoft! 🇨🇴**
