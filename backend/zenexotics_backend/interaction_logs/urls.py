from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .v1 import views

router = DefaultRouter()
# Add your viewset routes here if needed

app_name = 'interaction_logs'

urlpatterns = [
    path('v1/', include((router.urls, app_name), namespace='v1')),
]