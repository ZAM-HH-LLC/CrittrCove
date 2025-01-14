from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .v1.views import ServiceRateViewSet

router = DefaultRouter()
router.register(r'service-rates', ServiceRateViewSet, basename='service-rates')

app_name = 'service_rates'

urlpatterns = [
    path('v1/', include((router.urls, app_name), namespace='v1')),
]