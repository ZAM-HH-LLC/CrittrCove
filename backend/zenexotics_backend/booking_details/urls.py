from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .v1.views import BookingDetailsViewSet

router = DefaultRouter()
router.register(r'booking-details', BookingDetailsViewSet, basename='booking-details')

app_name = 'booking_details'

urlpatterns = [
    path('v1/', include((router.urls, app_name), namespace='v1')),
]