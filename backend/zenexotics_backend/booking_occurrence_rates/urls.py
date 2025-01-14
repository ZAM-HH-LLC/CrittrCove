from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .v1.views import BookingOccurrenceRateViewSet

router = DefaultRouter()
router.register(r'booking-occurrence-rates', BookingOccurrenceRateViewSet)

app_name = 'booking_occurrence_rates'

urlpatterns = [
    path('v1/', include((router.urls, app_name), namespace='v1')),
]