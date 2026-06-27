from rest_framework import serializers
from django.utils import timezone
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        exclude = ['verification_code']

class CustomerRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['full_name', 'phone_number']

    def validate_phone_number(self, value):
        # Validar formato de teléfono (ejemplo simple)
        if not value.isdigit() or len(value) < 10:
            raise serializers.ValidationError("Número de teléfono inválido")
        return value

class CustomerVerificationSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20)
    verification_code = serializers.CharField(max_length=6)

    def validate_verification_code(self, value):
        # Validar que sea numérico
        if not value.isdigit():
            raise serializers.ValidationError("El código debe ser numérico")
        return value

    def validate(self, data):
        phone_number = data.get('phone_number')
        verification_code = data.get('verification_code')

        try:
            customer = Customer.objects.get(phone_number=phone_number)
        except Customer.DoesNotExist:
            raise serializers.ValidationError("Número de teléfono no encontrado")

        if customer.verification_code != verification_code:
            raise serializers.ValidationError("Código de verificación incorrecto")

        if customer.code_expires_at and customer.code_expires_at < timezone.now():
            raise serializers.ValidationError("El código de verificación ha expirado")

        return data

    def save(self):
        phone_number = self.validated_data.get('phone_number')
        customer = Customer.objects.get(phone_number=phone_number)
        customer.phone_verified = True
        customer.verification_code = None
        customer.code_expires_at = None
        customer.save()
        return customer
