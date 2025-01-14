from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .v1 import views

router = DefaultRouter()

app_name = 'booking_drafts'

urlpatterns = [
    path('v1/', include((router.urls, app_name), namespace='v1')),
]