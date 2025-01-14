from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

app_name = 'payments'

# Initialize the router
router = DefaultRouter()

# Define URL patterns
urlpatterns = [
   path('v1/', include((router.urls, app_name), namespace='v1')),
]