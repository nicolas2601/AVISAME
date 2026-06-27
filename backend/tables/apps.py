from django.apps import AppConfig


class TablesConfig(AppConfig):
    default_auto_field: str = 'django.db.models.BigAutoField'
    name: str = 'tables'

    def ready(self) -> None:
        from . import signals  # noqa: F401
