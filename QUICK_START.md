# ⚡ Quick Start - AvisameAccasoft MVP

## 🚀 Inicio Rápido en 5 Minutos

### 1. Instalar Dependencias
```bash
cd backend
uv add django djangorestframework django-filter python-decouple psycopg2-binary qrcode[pil] pillow django-cors-headers django-extensions
```

### 2. Ejecutar Migraciones
```bash
uv run python manage.py makemigrations
uv run python manage.py migrate
```

### 3. Crear Datos de Prueba
```bash
uv run python manage.py seed_data
```

### 4. Iniciar Servidor
```bash
uv run python manage.py runserver
```

### 5. Acceder a la Documentación
```
http://localhost:8000/docs/
```

---

## 📚 Documentación

### Acceso Rápido
- **JSON API Docs:** `GET http://localhost:8000/docs/`
- **Markdown Guide:** Ver `API_DOCUMENTATION.md`
- **Postman Collection:** Importar `postman_collection.json`

---

## 🧪 Pruebas Rápidas

### Listar Restaurantes
```bash
curl http://localhost:8000/api/restaurants/
```

### Obtener Menú
```bash
curl http://localhost:8000/api/restaurants/{restaurant_id}/menu/
```

### Registrar Cliente
```bash
curl -X POST http://localhost:8000/api/customers/register/ \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Juan","phone_number":"3001234567"}'
```

### Solicitar Mesero
```bash
curl -X POST http://localhost:8000/api/tables/{table_id}/request-waiter/ \
  -H "Content-Type: application/json" \
  -d '{"customer_id":"{customer_id}"}'
```

---

## 📊 Datos Incluidos

✅ 1 Restaurante: "La Cosecha Colombiana"  
✅ 4 Categorías de menú  
✅ 14 Platos típicos colombianos  
✅ 10 Mesas con códigos QR  

---

## 🔗 Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/restaurants/` | Listar restaurantes |
| GET | `/api/restaurants/{id}/menu/` | Obtener menú |
| GET | `/api/tables/?restaurant={id}` | Listar mesas |
| POST | `/api/tables/{id}/request-waiter/` | Solicitar mesero |
| POST | `/api/tables/{id}/request-bill/` | Solicitar cuenta |
| POST | `/api/customers/register/` | Registrar cliente |
| POST | `/api/customers/verify/` | Verificar cliente |

---

## 💡 Flujo Típico

```
1. Cliente escanea QR → obtiene table_id
2. Cliente se registra → obtiene customer_id
3. Cliente verifica código
4. Cliente solicita mesero
5. Cliente ve menú
6. Cliente solicita cuenta
```

---

## 🎯 Próximos Pasos

1. **Frontend:** Crear interfaz web/móvil
2. **WebSockets:** Notificaciones en tiempo real
3. **SMS:** Integración con Twilio
4. **Admin:** Dashboard de administrador
5. **Analytics:** Estadísticas y reportes

---

## ❓ Preguntas Frecuentes

**P: ¿Dónde están los códigos QR?**  
R: Se generan automáticamente en `backend/media/qr_codes/`

**P: ¿Cómo cambio el código de verificación?**  
R: Se genera automáticamente. En desarrollo se devuelve en la respuesta.

**P: ¿Puedo usar otra base de datos?**  
R: Sí, edita `settings.py` y cambia la configuración de `DATABASES`

**P: ¿Cómo agrego más restaurantes?**  
R: Usa el endpoint `POST /api/restaurants/` o el admin de Django

---

## 📞 Soporte

Para ayuda, consulta:
- `README.md` - Documentación completa
- `API_DOCUMENTATION.md` - Guía detallada de endpoints
- `http://localhost:8000/docs/` - Documentación interactiva

---

**¡Listo para empezar! 🚀**
