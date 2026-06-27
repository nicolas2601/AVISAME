# 🍽️ AvisameAccasoft MVP

Sistema de gestión de restaurantes con solicitudes de mesa en tiempo real. Los clientes escanean códigos QR en las mesas para solicitar mesero, pedir la cuenta y ver el menú.

## 🚀 Características

- ✅ **Gestión de Restaurantes** - Crear y administrar restaurantes
- ✅ **Menús Digitales** - Menús con categorías, precios y disponibilidad
- ✅ **Códigos QR** - Generación automática de QR por mesa
- ✅ **Sistema de Solicitudes** - Llamar mesero, pedir cuenta, cancelar
- ✅ **Verificación de Clientes** - Registro y verificación por SMS (mock)
- ✅ **Sesiones de Mesa** - Seguimiento de clientes en mesas
- ✅ **Documentación Interactiva** - JSON, Markdown y Postman

## 📋 Stack Tecnológico

**Backend:**
- Django 6.0+
- Django REST Framework
- PostgreSQL (Supabase)
- Python 3.13+

**Herramientas:**
- uv (gestor de paquetes)
- QRCode (generación de códigos QR)
- Pillow (procesamiento de imágenes)

## 🏗️ Estructura del Proyecto

```
AvisameAccasoft/
├── backend/
│   ├── config/              # Configuración principal
│   ├── restaurants/         # App de restaurantes y menús
│   ├── tables/             # App de mesas y solicitudes
│   ├── customers/          # App de clientes
│   ├── api_documentation.py # Vista de documentación JSON
│   └── manage.py
├── API_DOCUMENTATION.md     # Documentación completa
├── postman_collection.json  # Colección para Postman
└── README.md               # Este archivo
```

## 🗄️ Modelos de Base de Datos

### Restaurant
```python
- id (UUID)
- name (CharField)
- address (TextField)
- phone (CharField)
- email (EmailField)
- is_active (BooleanField)
- created_at, updated_at (DateTimeField)
```

### MenuCategory
```python
- id (UUID)
- name (CharField)
- restaurant (ForeignKey)
- order (PositiveIntegerField)
- is_active (BooleanField)
```

### MenuItem
```python
- id (UUID)
- restaurant (ForeignKey)
- category (ForeignKey)
- name (CharField)
- description (TextField)
- price (DecimalField)
- image (ImageField)
- is_available (BooleanField)
- preparation_time (PositiveIntegerField)
- order (PositiveIntegerField)
```

### Table
```python
- id (UUID)
- restaurant (ForeignKey)
- table_number (CharField)
- capacity (PositiveIntegerField)
- is_active (BooleanField)
- qr_code (CharField, unique)
- qr_image (ImageField)
```

### TableSession
```python
- id (UUID)
- table (ForeignKey)
- customer (ForeignKey)
- is_active (BooleanField)
- started_at, ended_at (DateTimeField)
```

### TableRequest
```python
- id (UUID)
- session (ForeignKey)
- request_type (CharField: call_waiter, bill, menu, other)
- status (CharField: pending, in_progress, completed, cancelled)
- notes (TextField)
- created_at, updated_at (DateTimeField)
```

### Customer
```python
- id (UUID)
- full_name (CharField)
- phone_number (CharField, unique)
- phone_verified (BooleanField)
- verification_code (CharField)
- code_expires_at (DateTimeField)
- created_at, updated_at (DateTimeField)
```

## 🔌 Endpoints API

### 🏪 Restaurantes
```
GET    /api/restaurants/                    # Listar restaurantes
GET    /api/restaurants/{id}/menu/          # Obtener menú
```

### 🪑 Mesas
```
GET    /api/tables/?restaurant={id}         # Listar mesas
POST   /api/tables/{id}/request-waiter/     # Solicitar mesero
POST   /api/tables/{id}/request-bill/       # Solicitar cuenta
POST   /api/tables/{id}/cancel-request/     # Cancelar solicitud
GET    /api/tables/{id}/active-request/     # Obtener solicitud activa
```

### 👤 Clientes
```
POST   /api/customers/register/             # Registrar cliente
POST   /api/customers/verify/               # Verificar cliente
```

## 📚 Documentación

### Acceso a la Documentación

**Documentación JSON (Recomendado):**
```
GET http://localhost:8000/docs/
```

**Archivos de Documentación:**
- `API_DOCUMENTATION.md` - Guía completa en Markdown
- `postman_collection.json` - Colección lista para Postman

### Importar en Postman

1. Abre Postman
2. Click en **Import** (esquina superior izquierda)
3. Selecciona **Link**
4. Pega: `http://localhost:8000/docs/`
5. Click en **Import**

O importa directamente el archivo `postman_collection.json`

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd AvisameAccasoft
```

### 2. Instalar dependencias
```bash
cd backend
uv add django djangorestframework django-filter python-decouple psycopg2-binary qrcode[pil] pillow django-cors-headers django-extensions
```

### 3. Configurar variables de entorno
```bash
# Crear archivo .env en backend/
cp .env.example .env

# Editar .env con tus credenciales de Supabase
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=tu-clave-secreta
DEBUG=True
```

### 4. Ejecutar migraciones
```bash
uv run python manage.py makemigrations
uv run python manage.py migrate
```

### 5. Crear datos de prueba
```bash
uv run python manage.py seed_data
```

### 6. Iniciar el servidor
```bash
uv run python manage.py runserver
```

## 📊 Datos de Prueba

El comando `seed_data` crea automáticamente:

- **1 Restaurante:** "La Cosecha Colombiana" en Bogotá
- **4 Categorías:** Entradas, Platos Típicos, Bebidas, Postres
- **14 Platos:** Con precios en COP (pesos colombianos)
- **10 Mesas:** Con códigos QR generados automáticamente

### Ejecutar seed_data
```bash
uv run python manage.py seed_data
```

## 🔄 Flujo de Uso Típico

```
1. Cliente escanea QR de la mesa
   └─ Obtiene: restaurant_id:table_id

2. Cliente se registra con su teléfono
   POST /api/customers/register/

3. Cliente verifica su teléfono con código SMS
   POST /api/customers/verify/

4. Cliente solicita mesero
   POST /api/tables/{id}/request-waiter/

5. Cliente visualiza menú del restaurante
   GET /api/restaurants/{id}/menu/

6. Cliente solicita la cuenta
   POST /api/tables/{id}/request-bill/
```

## 🧪 Ejemplos de Uso

### Registrar Cliente
```bash
curl -X POST http://localhost:8000/api/customers/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Juan Pérez",
    "phone_number": "3001234567"
  }'
```

### Solicitar Mesero
```bash
curl -X POST http://localhost:8000/api/tables/{table_id}/request-waiter/ \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "{customer_id}"
  }'
```

### Obtener Menú
```bash
curl -X GET http://localhost:8000/api/restaurants/{restaurant_id}/menu/
```

## 📱 Respuestas de API

### Éxito (200)
```json
{
  "message": "Mesero solicitado",
  "request": { ... },
  "session_id": "550e8400-e29b-41d4-a716-446655440005"
}
```

### Error (400)
```json
{
  "error": "customer_id requerido"
}
```

### No Encontrado (404)
```json
{
  "error": "No hay solicitud pendiente"
}
```

## 🔐 Seguridad

- ✅ Validación de datos en serializers
- ✅ Manejo de excepciones
- ✅ UUIDs para IDs (no secuenciales)
- ✅ Códigos de verificación con expiración
- ✅ Timestamps automáticos (created_at, updated_at)

## 🚧 Próximas Características

- [ ] Autenticación JWT
- [ ] WebSockets para notificaciones en tiempo real
- [ ] Integración con SMS (Twilio)
- [ ] Dashboard de administrador
- [ ] Estadísticas y reportes
- [ ] Calificaciones y comentarios
- [ ] Historial de pedidos

## 🐛 Solución de Problemas

### Error: "django.core.exceptions.FieldError"
**Solución:** Ejecuta `uv run python manage.py makemigrations` y `uv run python manage.py migrate`

### Error: "Import could not be resolved"
**Solución:** Instala las dependencias: `uv add django djangorestframework ...`

### Error: "Table matching query does not exist"
**Solución:** Ejecuta `uv run python manage.py seed_data` para crear datos de prueba

## 📞 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

## 📄 Licencia

Este proyecto está bajo licencia MIT.

---

**¡Disfruta usando AvisameAccasoft! 🇨🇴**

Desarrollado con ❤️ para restaurantes colombianos
