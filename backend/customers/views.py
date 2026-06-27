from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.conf import settings

from .models import Customer
from .serializers import (
    CustomerSerializer, 
    CustomerRegistrationSerializer,
    CustomerVerificationSerializer
)
from .services import send_verification_code_sms

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

    def get_permissions(self):
        if self.action in {"register", "verify"}:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(
        detail=False,
        methods=['post'],
        url_path='register',
        authentication_classes=[],
        permission_classes=[AllowAny],
    )
    def register(self, request):
        """Registro de nuevo cliente"""
        serializer = CustomerRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            full_name = serializer.validated_data['full_name']
            
            # Buscar o crear customer
            customer, created = Customer.objects.get_or_create(
                phone_number=phone_number,
                defaults={'full_name': full_name}
            )
            
            # Si ya existe pero no verificado, actualizar nombre
            if not created and not customer.phone_verified:
                customer.full_name = full_name
                customer.save()
            
            # Generar código
            customer.generate_verification_code()

            sms_sent = send_verification_code_sms(customer)

            response_data = {
                "message": "Código enviado",
                "customer_id": customer.id,
                "phone_number": customer.phone_number,
                "sms_sent": sms_sent,
            }

            if settings.DEBUG:
                response_data["verification_code"] = customer.verification_code

            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=False,
        methods=['post'],
        url_path='verify',
        authentication_classes=[],
        permission_classes=[AllowAny],
    )
    def verify(self, request):
        """Verificar código SMS"""
        serializer = CustomerVerificationSerializer(data=request.data)
        
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            code = serializer.validated_data['verification_code']
            
            try:
                customer = Customer.objects.get(phone_number=phone_number)
                
                # Validar código
                if customer.verification_code != code:
                    return Response(
                        {"error": "Código inválido"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Validar expiración
                from django.utils import timezone
                if customer.code_expires_at < timezone.now():
                    return Response(
                        {"error": "Código expirado"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Verificar
                customer.phone_verified = True
                customer.verification_code = None
                customer.code_expires_at = None
                customer.save()
                
                return Response({
                    "message": "Teléfono verificado",
                    "customer": CustomerSerializer(customer).data
                })
                
            except Customer.DoesNotExist:
                return Response(
                    {"error": "Cliente no encontrado"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
