from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Client
from .serializers import ClientSerializer
from bookings.models import Booking
import logging

logger = logging.getLogger(__name__)

# Create your views here.

class ClientListView(generics.ListAPIView):
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        logger.info("=== Starting Client List Request ===")
        logger.info(f"Request user: {user.email}")
        
        if not user.is_sitter:
            logger.warning(f"User {user.email} is not a sitter - returning empty list")
            return Client.objects.none()
        
        # Get clients that have bookings with this sitter
        booked_client_ids = Booking.objects.filter(
            sitter=user
        ).values_list('client__id', flat=True).distinct()
        
        logger.info(f"Found {len(booked_client_ids)} clients with bookings")
        return Client.objects.filter(id__in=booked_client_ids)

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        logger.info(f"Response data count: {len(response.data)}")
        return response
