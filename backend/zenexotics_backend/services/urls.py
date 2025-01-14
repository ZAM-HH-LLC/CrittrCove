from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

app_name = 'services'

urlpatterns = [
    path('v1/', include((router.urls, app_name), namespace='v1')),
]