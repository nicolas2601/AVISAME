from django.contrib import admin
from .models import Customer

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'phone_number', 'phone_verified', 'created_at', 'updated_at']
    list_filter = ['phone_verified', 'created_at']
    search_fields = ['full_name', 'phone_number']
    readonly_fields = ['id', 'verification_code', 'code_expires_at', 'created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('full_name', 'phone_number')
        }),
        ('Verification', {
            'fields': ('phone_verified', 'verification_code', 'code_expires_at')
        }),
        ('Timestamps', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
