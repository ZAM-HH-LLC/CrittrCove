from django.urls import path
from . import views

urlpatterns = [
    path('<int:booking_id>/update_pets/', views.BookingDraftUpdatePetsView.as_view(), name='booking-draft-update-pets'),
    path('<int:booking_id>/available_pets/', views.AvailablePetsView.as_view(), name='booking-draft-available-pets'),
]