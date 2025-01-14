from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .v1.views import BookingSummaryViewSet

router = DefaultRouter()
router.register(r'booking-summary', BookingSummaryViewSet, basename='booking-summary')

app_name = 'booking_summary'

urlpatterns = [
    path('v1/', include((router.urls, app_name), namespace='v1')),
]