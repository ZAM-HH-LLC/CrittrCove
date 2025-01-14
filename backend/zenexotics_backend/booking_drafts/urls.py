from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .v1.views import BookingDraftViewSet

router = DefaultRouter()
router.register(r'booking-drafts', BookingDraftViewSet)

app_name = 'booking_drafts'

urlpatterns = [
    path('v1/', include((router.urls, app_name), namespace='v1')),
]