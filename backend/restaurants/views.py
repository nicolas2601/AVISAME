from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Restaurant, MenuItem
from .serializers import RestaurantSerializer, MenuItemSerializer

PUBLIC_ACTIONS = {'list', 'retrieve', 'menu'}


class RestaurantViewSet(viewsets.ModelViewSet):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer

    def get_permissions(self):
        if getattr(self, 'action', None) in PUBLIC_ACTIONS:
            return [AllowAny()]
        return super().get_permissions()

    def get_authenticators(self):
        if getattr(self, 'action', None) in PUBLIC_ACTIONS:
            return []
        return super().get_authenticators()

    @action(detail=True, methods=['get'], url_path='menu')
    def menu(self, request, pk=None):
        """Obtener menú del restaurante"""
        restaurant = self.get_object()
        
        menu_items = MenuItem.objects.filter(
            restaurant=restaurant,
            is_available=True
        ).select_related('category')
        
        serializer = MenuItemSerializer(menu_items, many=True, context={'request': request})
        
        return Response({
            "restaurant_name": restaurant.name,
            "items": serializer.data
        })
