"""
Documentación interactiva de la API - AvisameAccasoft MVP
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import json


class APIDocumentationView(APIView):
    """Vista que proporciona documentación completa de la API en formato JSON"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Retorna documentación completa de todos los endpoints"""
        
        documentation = {
            "title": "🍽️ AvisameAccasoft - API Documentation",
            "version": "1.0.0",
            "description": "Sistema de gestión de restaurantes con solicitudes de mesa en tiempo real",
            "base_url": "http://localhost:8000/api",
            "authentication": {
                "type": "No requerida en MVP",
                "note": "En producción se implementará JWT o Token Authentication"
            },
            
            "endpoints": {
                
                # ==================== RESTAURANTES ====================
                "restaurants": {
                    "title": "🏪 Restaurantes",
                    "description": "Gestión de restaurantes y menús",
                    
                    "list_all": {
                        "method": "GET",
                        "path": "/restaurants/",
                        "description": "Obtener lista de todos los restaurantes",
                        "example": {
                            "url": "GET http://localhost:8000/api/restaurants/",
                            "response": {
                                "status": 200,
                                "body": [
                                    {
                                        "id": "550e8400-e29b-41d4-a716-446655440000",
                                        "name": "La Cosecha Colombiana",
                                        "address": "Carrera 7 #40-62, Bogotá, Colombia",
                                        "phone": "+57 1 123 4567",
                                        "email": "info@lacosechacol.com",
                                        "is_active": True,
                                        "created_at": "2025-12-06T09:00:00Z",
                                        "updated_at": "2025-12-06T09:00:00Z"
                                    }
                                ]
                            }
                        }
                    },
                    
                    "get_menu": {
                        "method": "GET",
                        "path": "/restaurants/{id}/menu/",
                        "description": "Obtener menú completo del restaurante con items disponibles",
                        "parameters": {
                            "id": "UUID del restaurante"
                        },
                        "example": {
                            "url": "GET http://localhost:8000/api/restaurants/550e8400-e29b-41d4-a716-446655440000/menu/",
                            "response": {
                                "status": 200,
                                "body": {
                                    "restaurant_name": "La Cosecha Colombiana",
                                    "items": [
                                        {
                                            "id": "550e8400-e29b-41d4-a716-446655440001",
                                            "name": "Bandeja Paisa",
                                            "description": "Frijoles, arroz, carne molida, chicharrón, chorizo, aguacate, plátano, arepa y huevo",
                                            "price": "35000.00",
                                            "category_name": "Platos Típicos",
                                            "image_url": "http://localhost:8000/media/menu_items/bandeja.jpg",
                                            "is_available": True,
                                            "preparation_time": 30
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                
                # ==================== MESAS ====================
                "tables": {
                    "title": "🪑 Mesas",
                    "description": "Gestión de mesas y solicitudes",
                    
                    "list_by_restaurant": {
                        "method": "GET",
                        "path": "/tables/?restaurant={restaurant_id}",
                        "description": "Obtener todas las mesas de un restaurante",
                        "parameters": {
                            "restaurant": "UUID del restaurante (query param)"
                        },
                        "example": {
                            "url": "GET http://localhost:8000/api/tables/?restaurant=550e8400-e29b-41d4-a716-446655440000",
                            "response": {
                                "status": 200,
                                "body": [
                                    {
                                        "id": "550e8400-e29b-41d4-a716-446655440002",
                                        "restaurant": "550e8400-e29b-41d4-a716-446655440000",
                                        "restaurant_name": "La Cosecha Colombiana",
                                        "table_number": "1",
                                        "capacity": 4,
                                        "is_active": True,
                                        "qr_code": "550e8400-e29b-41d4-a716-446655440000:1",
                                        "qr_image_url": "http://localhost:8000/media/qr_codes/qr_1.png",
                                        "created_at": "2025-12-06T09:00:00Z",
                                        "updated_at": "2025-12-06T09:00:00Z"
                                    }
                                ]
                            }
                        }
                    },
                    
                    "request_waiter": {
                        "method": "POST",
                        "path": "/tables/{id}/request-waiter/",
                        "description": "Solicitar mesero a la mesa",
                        "parameters": {
                            "id": "UUID de la mesa (path param)"
                        },
                        "request_body": {
                            "customer_id": "UUID del cliente"
                        },
                        "example": {
                            "url": "POST http://localhost:8000/api/tables/550e8400-e29b-41d4-a716-446655440002/request-waiter/",
                            "headers": {
                                "Content-Type": "application/json"
                            },
                            "body": {
                                "customer_id": "550e8400-e29b-41d4-a716-446655440003"
                            },
                            "response": {
                                "status": 200,
                                "body": {
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
                            }
                        }
                    },
                    
                    "request_bill": {
                        "method": "POST",
                        "path": "/tables/{id}/request-bill/",
                        "description": "Solicitar la cuenta",
                        "parameters": {
                            "id": "UUID de la mesa (path param)"
                        },
                        "request_body": {
                            "customer_id": "UUID del cliente"
                        },
                        "example": {
                            "url": "POST http://localhost:8000/api/tables/550e8400-e29b-41d4-a716-446655440002/request-bill/",
                            "headers": {
                                "Content-Type": "application/json"
                            },
                            "body": {
                                "customer_id": "550e8400-e29b-41d4-a716-446655440003"
                            },
                            "response": {
                                "status": 200,
                                "body": {
                                    "message": "Cuenta solicitada",
                                    "request": {
                                        "id": "550e8400-e29b-41d4-a716-446655440006",
                                        "session": "550e8400-e29b-41d4-a716-446655440005",
                                        "request_type": "bill",
                                        "status": "pending",
                                        "notes": "",
                                        "created_at": "2025-12-06T09:20:00Z",
                                        "updated_at": "2025-12-06T09:20:00Z"
                                    },
                                    "session_id": "550e8400-e29b-41d4-a716-446655440005"
                                }
                            }
                        }
                    },
                    
                    "cancel_request": {
                        "method": "POST",
                        "path": "/tables/{id}/cancel-request/",
                        "description": "Cancelar solicitud activa",
                        "parameters": {
                            "id": "UUID de la mesa (path param)"
                        },
                        "request_body": {
                            "customer_id": "UUID del cliente"
                        },
                        "example": {
                            "url": "POST http://localhost:8000/api/tables/550e8400-e29b-41d4-a716-446655440002/cancel-request/",
                            "headers": {
                                "Content-Type": "application/json"
                            },
                            "body": {
                                "customer_id": "550e8400-e29b-41d4-a716-446655440003"
                            },
                            "response": {
                                "status": 200,
                                "body": {
                                    "message": "Solicitud cancelada",
                                    "has_active_session": True
                                }
                            }
                        }
                    },
                    
                    "active_request": {
                        "method": "GET",
                        "path": "/tables/{id}/active-request/",
                        "description": "Obtener solicitud activa de la mesa",
                        "parameters": {
                            "id": "UUID de la mesa (path param)",
                            "customer_id": "UUID del cliente (query param, opcional)"
                        },
                        "example": {
                            "url": "GET http://localhost:8000/api/tables/550e8400-e29b-41d4-a716-446655440002/active-request/?customer_id=550e8400-e29b-41d4-a716-446655440003",
                            "response": {
                                "status": 200,
                                "body": {
                                    "has_active_request": True,
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
                            }
                        }
                    }
                },
                
                # ==================== CLIENTES ====================
                "customers": {
                    "title": "👤 Clientes",
                    "description": "Registro y verificación de clientes",
                    
                    "register": {
                        "method": "POST",
                        "path": "/customers/register/",
                        "description": "Registrar nuevo cliente o actualizar existente",
                        "request_body": {
                            "full_name": "Nombre completo del cliente",
                            "phone_number": "Número de teléfono (mínimo 10 dígitos)"
                        },
                        "example": {
                            "url": "POST http://localhost:8000/api/customers/register/",
                            "headers": {
                                "Content-Type": "application/json"
                            },
                            "body": {
                                "full_name": "Juan Pérez",
                                "phone_number": "3001234567"
                            },
                            "response": {
                                "status": 201,
                                "body": {
                                    "message": "Código enviado",
                                    "customer_id": "550e8400-e29b-41d4-a716-446655440003",
                                    "phone_number": "3001234567",
                                    "verification_code": "123456"
                                }
                            }
                        }
                    },
                    
                    "verify": {
                        "method": "POST",
                        "path": "/customers/verify/",
                        "description": "Verificar código SMS del cliente",
                        "request_body": {
                            "phone_number": "Número de teléfono registrado",
                            "verification_code": "Código de 6 dígitos recibido"
                        },
                        "example": {
                            "url": "POST http://localhost:8000/api/customers/verify/",
                            "headers": {
                                "Content-Type": "application/json"
                            },
                            "body": {
                                "phone_number": "3001234567",
                                "verification_code": "123456"
                            },
                            "response": {
                                "status": 200,
                                "body": {
                                    "message": "Teléfono verificado",
                                    "customer": {
                                        "id": "550e8400-e29b-41d4-a716-446655440003",
                                        "full_name": "Juan Pérez",
                                        "phone_number": "3001234567",
                                        "phone_verified": True,
                                        "created_at": "2025-12-06T09:00:00Z",
                                        "updated_at": "2025-12-06T09:10:00Z"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            
            "workflow_example": {
                "title": "Flujo Típico de Uso",
                "steps": [
                    {
                        "step": 1,
                        "description": "Cliente escanea QR de la mesa",
                        "endpoint": "GET /tables/?restaurant={id}",
                        "note": "El QR contiene: restaurant_id:table_id"
                    },
                    {
                        "step": 2,
                        "description": "Cliente se registra con su teléfono",
                        "endpoint": "POST /customers/register/",
                        "body": {"full_name": "Juan", "phone_number": "3001234567"}
                    },
                    {
                        "step": 3,
                        "description": "Cliente verifica su teléfono con código SMS",
                        "endpoint": "POST /customers/verify/",
                        "body": {"phone_number": "3001234567", "verification_code": "123456"}
                    },
                    {
                        "step": 4,
                        "description": "Cliente solicita mesero",
                        "endpoint": "POST /tables/{id}/request-waiter/",
                        "body": {"customer_id": "550e8400-e29b-41d4-a716-446655440003"}
                    },
                    {
                        "step": 5,
                        "description": "Cliente visualiza menú del restaurante",
                        "endpoint": "GET /restaurants/{id}/menu/"
                    },
                    {
                        "step": 6,
                        "description": "Cliente solicita la cuenta",
                        "endpoint": "POST /tables/{id}/request-bill/",
                        "body": {"customer_id": "550e8400-e29b-41d4-a716-446655440003"}
                    }
                ]
            },
            
            "postman_collection": {
                "info": {
                    "name": "AvisameAccasoft API",
                    "description": "Colección de endpoints para Postman",
                    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
                },
                "note": "Importa esta documentación en Postman usando la opción 'Import > Paste Raw Text'"
            },
            
            "error_codes": {
                "400": "Bad Request - Datos inválidos o incompletos",
                "404": "Not Found - Recurso no encontrado",
                "500": "Internal Server Error - Error del servidor"
            },
            
            "data_types": {
                "UUID": "Identificador único universal (ej: 550e8400-e29b-41d4-a716-446655440000)",
                "DateTime": "Formato ISO 8601 (ej: 2025-12-06T09:00:00Z)",
                "Decimal": "Número con decimales (ej: 35000.00)"
            }
        }
        
        return Response(documentation, status=status.HTTP_200_OK)
