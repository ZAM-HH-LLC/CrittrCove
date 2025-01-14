from django.urls import path, include
from rest_framework import routers

from . import views

router = routers.DefaultRouter()
# Add your v1 viewsets here if needed

app_name = 'service_moderation'

urlpatterns = [
    path('v1/', include((router.urls, app_name), namespace='v1')),
]