from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'shared_availability'

# Initialize the router
router = DefaultRouter()

# Define URL patterns
urlpatterns = [
    path('v1/', include((router.urls, app_name), namespace='v1')),
]