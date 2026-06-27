from django.contrib import admin, messages
from django.utils.html import format_html

from .models import Table, TableSession, TableRequest
from .utils import generate_qr_code


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = (
        "table_number",
        "restaurant",
        "capacity",
        "is_active",
        "qr_download_link",
    )
    list_filter = ("restaurant", "is_active")
    search_fields = ("table_number", "restaurant__name")
    readonly_fields = ("qr_code", "qr_image_preview")
    actions = ["regenerate_qr_codes"]

    @admin.display(description="QR")
    def qr_download_link(self, obj: Table):
        if obj.qr_image:
            return format_html(
                '<a href="{}" download target="_blank">Descargar QR</a>',
                obj.qr_image.url,
            )
        return "—"

    @admin.display(description="Vista previa")
    def qr_image_preview(self, obj: Table):
        if obj.qr_image:
            return format_html(
                '<img src="{}" alt="QR" style="max-width: 200px; height: auto;" />',
                obj.qr_image.url,
            )
        return "No disponible"

    @admin.action(description="Regenerar códigos QR seleccionados")
    def regenerate_qr_codes(self, request, queryset):
        updated = 0
        for table in queryset:
            qr_code, qr_image = generate_qr_code(table.restaurant.id, table.id)
            table.qr_code = qr_code
            table.qr_image = qr_image
            table.save(update_fields=["qr_code", "qr_image", "updated_at"])
            updated += 1

        if updated:
            messages.success(request, f"Se regeneraron {updated} códigos QR.")
        else:
            messages.info(request, "No se actualizaron códigos QR.")


@admin.register(TableSession)
class TableSessionAdmin(admin.ModelAdmin):
    list_display = ("table", "customer", "is_active", "started_at", "ended_at")
    list_filter = ("is_active", "table__restaurant")
    search_fields = ("table__table_number", "customer__full_name")


@admin.register(TableRequest)
class TableRequestAdmin(admin.ModelAdmin):
    list_display = ("session", "request_type", "status", "created_at")
    list_filter = ("request_type", "status")
    search_fields = ("session__table__table_number", "session__customer__full_name")
