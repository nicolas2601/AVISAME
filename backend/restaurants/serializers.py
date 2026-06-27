from rest_framework import serializers
from .models import Restaurant, MenuItem, MenuCategory

class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = '__all__'

class MenuCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuCategory
        fields = '__all__'

class MenuItemSerializer(serializers.ModelSerializer):
    category = MenuCategorySerializer(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = '__all__'

    def get_image_url(self, obj):
        image_field = getattr(obj, 'image', None)
        if not image_field:
            return None

        image_name = getattr(image_field, 'name', '') or ''
        if image_name.startswith(('http://', 'https://')):
            return image_name

        if 'http://' in image_name or 'https://' in image_name:
            http_index = image_name.find('http')
            if http_index != -1:
                return image_name[http_index:]

        try:
            image_url = image_field.url
        except Exception:
            return None

        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(image_url)
        return image_url
