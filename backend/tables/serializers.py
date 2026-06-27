from rest_framework import serializers
from .models import Table, TableSession, TableRequest

class TableSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.SerializerMethodField()
    qr_image_url = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Table
        fields = '__all__'

    def get_status(self, obj):
        pending_request_exists = TableRequest.objects.filter(
            session__table=obj,
            status='pending',
        ).exists()

        if pending_request_exists:
            return 'requested'

        active_session_exists = TableSession.objects.filter(
            table=obj,
            is_active=True,
        ).exists()

        if active_session_exists:
            return 'occupied'

        return 'available'

    def get_restaurant_name(self, obj):
        return obj.restaurant.name

    def get_qr_image_url(self, obj):
        if obj.qr_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.qr_image.url)
            return obj.qr_image.url
        return None

class TableSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TableSession
        fields = '__all__'

class TableRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = TableRequest
        fields = '__all__'
