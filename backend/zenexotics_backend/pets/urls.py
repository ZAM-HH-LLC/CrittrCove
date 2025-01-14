from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .v1 import views

router = DefaultRouter()
router.register(r'pets', views.PetViewSet, basename='pet')

app_name = 'pets'

urlpatterns = [
    path('v1/', include((router.urls, app_name), namespace='v1')),
]