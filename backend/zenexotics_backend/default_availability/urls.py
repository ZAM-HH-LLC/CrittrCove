from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DefaultAvailabilityViewSet

router = DefaultRouter()
router.register(r'default-availability', DefaultAvailabilityViewSet)
# Add your viewset routes here if needed

app_name = 'default_availability'

urlpatterns = [
    path('v1/', include((router.urls, app_name), namespace='v1')),
]