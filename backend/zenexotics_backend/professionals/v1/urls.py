from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.get_professional_dashboard, name='professional_dashboard'),
] 