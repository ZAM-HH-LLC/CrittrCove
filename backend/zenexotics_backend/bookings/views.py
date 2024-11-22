from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Booking
from .serializers import BookingSerializer
import logging

logger = logging.getLogger(__name__)

class BookingListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BookingSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_sitter:
            return Booking.objects.filter(sitter=user)
        return Booking.objects.filter(client__user=user)

    def perform_create(self, serializer):
        serializer.save(client_id=self.request.data.get('client_id'))

class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BookingSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_sitter:
            return Booking.objects.filter(sitter=user)
        return Booking.objects.filter(client__user=user)
