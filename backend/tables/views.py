import uuid

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from restaurants.models import Restaurant
from restaurants.serializers import RestaurantSerializer

from .models import Table, TableSession, TableRequest
from .serializers import TableSerializer, TableSessionSerializer, TableRequestSerializer

PUBLIC_ACTIONS = {
    'scan_qr',
    'list',
    'retrieve',
    'active_request',
    'request_waiter',
    'request_bill',
    'cancel_request',
}


class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.all().order_by('table_number')
    serializer_class = TableSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['restaurant']

    def get_permissions(self):
        if getattr(self, 'action', None) in PUBLIC_ACTIONS:
            return [AllowAny()]
        return super().get_permissions()

    def get_authenticators(self):
        if getattr(self, 'action', None) in PUBLIC_ACTIONS:
            return []
        return super().get_authenticators()

    @action(
        detail=False,
        methods=['post'],
        url_path='scan-qr',
        authentication_classes=[],
        permission_classes=[AllowAny],
    )
    def scan_qr(self, request):
        """Validar un QR de mesa y retornar datos del restaurante y mesa."""

        qr_code = request.data.get('qr_code')
        customer_id = request.data.get('customer_id')

        if not qr_code:
            return Response({"error": "qr_code requerido"}, status=status.HTTP_400_BAD_REQUEST)

        parts = str(qr_code).split(':')
        if len(parts) != 2:
            return Response({"error": "Formato de QR inválido"}, status=status.HTTP_400_BAD_REQUEST)

        restaurant_id, table_id = parts

        try:
            uuid.UUID(restaurant_id)
            uuid.UUID(table_id)
        except ValueError:
            return Response({"error": "Identificadores inválidos en el QR"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            restaurant = Restaurant.objects.get(id=restaurant_id, is_active=True)
        except Restaurant.DoesNotExist:
            return Response({"error": "Restaurante no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        try:
            table = Table.objects.get(id=table_id, restaurant=restaurant, is_active=True)
        except Table.DoesNotExist:
            return Response({"error": "Mesa no encontrada"}, status=status.HTTP_404_NOT_FOUND)

        if table.qr_code and table.qr_code != qr_code:
            return Response({"error": "QR no coincide con la mesa"}, status=status.HTTP_400_BAD_REQUEST)

        session_id = None
        if customer_id:
            sessions = TableSession.objects.filter(
                table=table,
                customer_id=customer_id,
                is_active=True,
            ).order_by('-started_at')

            if sessions.exists():
                session = sessions.first()
            else:
                session = TableSession.objects.create(
                    table=table,
                    customer_id=customer_id,
                    is_active=True,
                    started_at=timezone.now()
                )
            session_id = session.id

        restaurant_data = RestaurantSerializer(restaurant, context={'request': request}).data
        table_data = TableSerializer(table, context={'request': request}).data

        response_payload = {
            "message": "QR válido",
            "restaurant": restaurant_data,
            "table": table_data,
        }

        if session_id:
            response_payload["session_id"] = session_id

        return Response(response_payload, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=['post'],
        url_path='request-waiter',
        authentication_classes=[],
        permission_classes=[AllowAny],
    )
    def request_waiter(self, request, pk=None):
        """Solicitar mesero"""
        table = self.get_object()
        customer_id = request.data.get('customer_id')
        
        if not customer_id:
            return Response(
                {"error": "customer_id requerido"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cancelar requests previos pendientes
        TableRequest.objects.filter(
            session__table=table, 
            status='pending'
        ).update(status='cancelled')
        
        # Buscar o crear sesión activa
        sessions = TableSession.objects.filter(
            table=table,
            customer_id=customer_id,
            is_active=True
        ).order_by('-started_at')

        if sessions.exists():
            session = sessions.first()
        else:
            session = TableSession.objects.create(
                table=table,
                customer_id=customer_id,
                is_active=True,
                started_at=timezone.now()
            )
        
        # Crear nueva solicitud
        table_request = TableRequest.objects.create(
            session=session,
            request_type='call_waiter'
        )
        
        return Response({
            "message": "Mesero solicitado",
            "request": TableRequestSerializer(table_request).data,
            "session_id": session.id
        })

    @action(
        detail=True,
        methods=['post'],
        url_path='request-bill',
        authentication_classes=[],
        permission_classes=[AllowAny],
    )
    def request_bill(self, request, pk=None):
        """Solicitar cuenta - similar a request_waiter"""
        table = self.get_object()
        customer_id = request.data.get('customer_id')
        
        if not customer_id:
            return Response(
                {"error": "customer_id requerido"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        TableRequest.objects.filter(
            session__table=table, 
            status='pending'
        ).update(status='cancelled')
        
        # Buscar o crear sesión activa
        session, created = TableSession.objects.get_or_create(
            table=table,
            customer_id=customer_id,
            is_active=True,
            defaults={'started_at': timezone.now()}
        )
        
        table_request = TableRequest.objects.create(
            session=session,
            request_type='bill'
        )
        
        return Response({
            "message": "Cuenta solicitada",
            "request": TableRequestSerializer(table_request).data,
            "session_id": session.id
        })

    @action(
        detail=True,
        methods=['post'],
        url_path='cancel-request',
        authentication_classes=[],
        permission_classes=[AllowAny],
    )
    def cancel_request(self, request, pk=None):
        """Cancelar solicitud activa"""
        table = self.get_object()
        customer_id = request.data.get('customer_id')
        
        if not customer_id:
            return Response(
                {"error": "customer_id requerido"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Buscar request pendiente del customer
        pending_request = TableRequest.objects.filter(
            session__table=table,
            session__customer_id=customer_id,
            status='pending'
        ).first()
        
        if not pending_request:
            return Response(
                {"error": "No hay solicitud pendiente"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Cancelar request
        pending_request.status = 'cancelled'
        pending_request.save()
        
        # Actualizar estado de mesa
        # Si hay sesión activa -> occupied, sino -> available
        has_active_session = TableSession.objects.filter(
            table=table, 
            is_active=True
        ).exists()
        
        # Nota: El modelo Table no tiene campo 'status', 
        # esto debería manejarse a nivel de lógica de negocio
        # o agregarse el campo al modelo
        
        return Response({
            "message": "Solicitud cancelada",
            "has_active_session": has_active_session
        })

    @action(detail=True, methods=['get'], url_path='active-request')
    def active_request(self, request, pk=None):
        """Obtener solicitud activa de la mesa"""
        table = self.get_object()
        customer_id = request.query_params.get('customer_id')
        
        # Buscar solicitud pendiente (opcionalmente filtrar por customer)
        active_req = TableRequest.objects.filter(
            session__table=table,
            status='pending'
        ).first()
        
        if active_req:
            return Response({
                "has_active_request": True,
                "request": TableRequestSerializer(active_req).data
            })
        
        return Response({
            "has_active_request": False,
            "request": None
        })

class TableSessionViewSet(viewsets.ModelViewSet):
    queryset = TableSession.objects.all()
    serializer_class = TableSessionSerializer

class TableRequestViewSet(viewsets.ModelViewSet):
    queryset = TableRequest.objects.all()
    serializer_class = TableRequestSerializer
