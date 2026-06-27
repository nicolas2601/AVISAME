from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import models
from typing import Any
from .models import Table
from .utils import generate_qr_code

@receiver(post_save, sender=Table)
def create_qr_code_for_table(sender: type[models.Model], instance: Table, created: bool, **kwargs: dict[str, Any]) -> None:
    """Genera QR code automáticamente cuando se crea una mesa"""
    if created and not instance.qr_code:
        qr_data, qr_image = generate_qr_code(
            instance.restaurant.id, 
            instance.id
        )
        instance.qr_code = qr_data
        instance.qr_image = qr_image
        instance.save()
