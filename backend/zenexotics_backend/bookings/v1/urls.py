from django.urls import path
from . import views

urlpatterns = [
    path('', views.BookingListView.as_view(), name='booking_list'),
    path('<int:booking_id>/', views.BookingDetailView.as_view(), name='booking_detail'),
    path('<int:booking_id>/update_pets/', views.BookingUpdatePetsView.as_view(), name='booking_update_pets'),
]