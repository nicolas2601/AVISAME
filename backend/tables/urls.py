from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TableViewSet, TableSessionViewSet, TableRequestViewSet

router = DefaultRouter()
router.register(r'', TableViewSet)
router.register(r'sessions', TableSessionViewSet, basename='table-sessions')
router.register(r'requests', TableRequestViewSet, basename='table-requests')

urlpatterns = [
    path('', include(router.urls)),
    path('scan-qr/', TableViewSet.as_view({'post': 'scan_qr'}), name='table-scan-qr'),
]
