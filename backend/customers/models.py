from django.db import models
import uuid
from datetime import timedelta
from django.utils import timezone

class Customer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=200)
    phone_number = models.CharField(max_length=20, unique=True)
    phone_verified = models.BooleanField(default=False)
    verification_code = models.CharField(max_length=6, null=True, blank=True)
    code_expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'customers'

    def __str__(self):
        return f"{self.full_name} ({self.phone_number})"

    def generate_verification_code(self):
        import random
        self.verification_code = str(random.randint(100000, 999999))
        self.code_expires_at = timezone.now() + timedelta(minutes=10)
        self.save()
