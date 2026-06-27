from django.db import models
import uuid

class Table(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey('restaurants.Restaurant', on_delete=models.CASCADE, related_name='tables')
    table_number = models.CharField(max_length=10)
    capacity = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)
    qr_code = models.CharField(max_length=100, unique=True, blank=True)
    qr_image = models.ImageField(upload_to='qr_codes/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tables'
        verbose_name = 'Table'
        verbose_name_plural = 'Tables'
        unique_together = ['restaurant', 'table_number']

    def __str__(self):
        return f"{self.restaurant.name} - Mesa {self.table_number}"

class TableSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name='sessions')
    customer = models.ForeignKey('customers.Customer', on_delete=models.CASCADE, related_name='sessions', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'table_sessions'
        verbose_name = 'Table Session'
        verbose_name_plural = 'Table Sessions'

    def __str__(self):
        return f"Session at {self.table} - {self.started_at}"

class TableRequest(models.Model):
    REQUEST_TYPES = [
        ('call_waiter', 'Llamar mesero'),
        ('bill', 'Pedir cuenta'),
        ('menu', 'Ver menú'),
        ('other', 'Otro'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('in_progress', 'En proceso'),
        ('completed', 'Completado'),
        ('cancelled', 'Cancelado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(TableSession, on_delete=models.CASCADE, related_name='requests')
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'table_requests'
        verbose_name = 'Table Request'
        verbose_name_plural = 'Table Requests'

    def __str__(self):
        return f"{self.get_request_type_display()} - {self.session}"