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
        ).values_list('client_id', flat=True).distinct()
        
        logger.info(f"Found {len(booked_client_ids)} clients with bookings")
        
        # Get all clients with bookings
        clients = Client.objects.filter(id__in=booked_client_ids)
        filtered_clients = []
        
        for client in clients:
            try:
                client_pet_types = client.get_pet_types()
                logger.info(f"Processing client {client.user.email} with pet types: {client_pet_types}")
                
                # Check if client has any pet types that match sitter's approvals
                matches = []
                if user.approved_dog_sitting and 'Dog' in client_pet_types:
                    matches.append('Dog')
                if user.approved_cat_sitting and 'Cat' in client_pet_types:
                    matches.append('Cat')
                if user.approved_exotics_sitting and 'Exotic' in client_pet_types:
                    matches.append('Exotic')
                
                if matches:
                    filtered_clients.append(client.id)
                    logger.info(f"Added client {client.user.email} - matched on: {matches}")
                else:
                    logger.info(f"Skipped client {client.user.email} - no matching pet types")
                    
            except Exception as e:
                logger.error(f"Error processing client {client.id}: {str(e)}")
                continue
        
        logger.info(f"Returning {len(filtered_clients)} filtered clients")
        return Client.objects.filter(id__in=filtered_clients)

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        logger.info(f"Response data count: {len(response.data)}")
        return response
