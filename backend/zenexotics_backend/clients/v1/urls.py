from django.urls import path
from . import views

urlpatterns = [
    path('', views.ClientListView.as_view(), name='client_list'),
    path('dashboard/', views.get_client_dashboard, name='client_dashboard'),
] 