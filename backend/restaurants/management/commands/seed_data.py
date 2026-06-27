from django.core.management.base import BaseCommand
from restaurants.models import Restaurant, MenuCategory, MenuItem
from tables.models import Table

class Command(BaseCommand):
    help = 'Crea datos de prueba para el MVP con contexto colombiano'

    def handle(self, *args, **kwargs):
        self.stdout.write('🌱 Creando datos de prueba con sabor colombiano...')
        
        # Crear restaurante con temática colombiana
        restaurant, created = Restaurant.objects.get_or_create(
            name="La Cosecha Colombiana",
            defaults={
                'address': 'Carrera 7 #40-62, Bogotá, Colombia',
                'phone': '+57 1 123 4567',
                'email': 'info@lacosechacol.com',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'✅ Restaurante creado: {restaurant.name}'))
        
        # Crear categorías típicas colombianas
        categories = [
            ('Entradas', 1),
            ('Platos Típicos', 2),
            ('Bebidas', 3),
            ('Postres', 4),
        ]
        
        for cat_name, order in categories:
            MenuCategory.objects.get_or_create(
                name=cat_name, 
                restaurant=restaurant,
                defaults={'order': order}
            )
        
        # Crear items de menú con precios en COP
        entrada_cat = MenuCategory.objects.get(name='Entradas', restaurant=restaurant)
        platos_cat = MenuCategory.objects.get(name='Platos Típicos', restaurant=restaurant)
        bebidas_cat = MenuCategory.objects.get(name='Bebidas', restaurant=restaurant)
        postres_cat = MenuCategory.objects.get(name='Postres', restaurant=restaurant)
        
        menu_items = [
            # Entradas
            ('Aguacate Relleno', 'Mitad de aguacate relleno de camarones y salsa de la casa', 18000, entrada_cat),
            ('Arepas de Choclo', 'Dos arepas de choclo con queso costeño', 12000, entrada_cat),
            ('Patacones con Hogao', 'Tajadas de plátano verde frito con salsa criolla', 15000, entrada_cat),
            
            # Platos Típicos
            ('Bandeja Paisa', 'Frijoles, arroz, carne molida, chicharrón, chorizo, aguacate, plátano, arepa y huevo', 35000, platos_cat),
            ('Ajiaco Santafereño', 'Sopa típica de Bogotá con pollo, papa criolla, mazorca y crema de leche', 28000, platos_cat),
            ('Sancocho de Gallina', 'Sopa espesa con gallina, yuca, plátano y mazorca', 30000, platos_cat),
            ('Lechona Tolimense', 'Carne de cerdo desmechada con arroz, envuelta en hoja de plátano', 32000, platos_cat),
            
            # Bebidas
            ('Jugo de Lulo', 'Jugo natural de lulo colombiano', 7000, bebidas_cat),
            ('Limonada de Coco', 'Refrescante limonada con coco rallado', 8000, bebidas_cat),
            ('Aguardiente Antioqueño', 'Tradicional aguardiente antioqueño (por copa)', 10000, bebidas_cat),
            ('Chocolate Santafereño', 'Chocolate caliente con queso y pan', 9000, bebidas_cat),
            
            # Postres
            ('Postre de Natas', 'Dulce tradicional colombiano', 10000, postres_cat),
            ('Arequipe con Queso', 'Arequipe casero con queso costeño', 12000, postres_cat),
            ('Mazamorra con Panela', 'Bebida dulce típica colombiana', 8000, postres_cat),
        ]
        
        for name, desc, price, cat in menu_items:
            item, created = MenuItem.objects.get_or_create(
                restaurant=restaurant,
                name=name,
                defaults={
                    'description': desc,
                    'price': price,
                    'category': cat,
                    'is_available': True,
                    'preparation_time': 20 if cat.name == 'Bebidas' else 30
                }
            )
            if created:
                self.stdout.write(f'  - {name} (${price:,.0f} COP)')
        
        self.stdout.write(self.style.SUCCESS(f'✅ {len(menu_items)} items de menú colombiano creados'))
        
        # Crear 10 mesas con capacidad para 4 personas cada una
        for i in range(1, 11):
            table, created = Table.objects.get_or_create(
                restaurant=restaurant,
                table_number=str(i),
                defaults={
                    'capacity': 4,
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'✅ Mesa {i} creada (Capacidad: 4 personas)'))
        
        self.stdout.write(self.style.SUCCESS('🎉 ¡Datos de prueba colombianos creados exitosamente!'))
        self.stdout.write('👉 Puedes ver los QR codes en: backend/media/qr_codes/')
        self.stdout.write('\n¡Bienvenido a La Cosecha Colombiana! 🇨🇴')
        self.stdout.write('Disfruta de la auténtica gastronomía colombiana en cada bocado.')
