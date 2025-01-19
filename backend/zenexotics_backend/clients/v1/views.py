from django.shortcuts import render
from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import date
from ..models import Client
from ..serializers import ClientSerializer, ClientBookingOccurrenceSerializer
from professional_status.models import ProfessionalStatus
from bookings.models import Booking
from booking_occurrences.models import BookingOccurrence
import logging

logger = logging.getLogger(__name__)

class ClientListView(generics.ListAPIView):
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        logger.info("=== Starting Client List Request ===")
        logger.info(f"Request user: {user.email}")
        
        try:
            professional_status = ProfessionalStatus.objects.get(user=user)
            if professional_status.is_approved:
                logger.info(f"User {user.email} is an approved professional - returning all clients")
                return Client.objects.all()
            else:
                logger.warning(f"User {user.email} is not an approved professional - returning empty list")
                return Client.objects.none()
        except ProfessionalStatus.DoesNotExist:
            logger.warning(f"User {user.email} has no professional status - returning empty list")
            return Client.objects.none()

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        logger.info(f"Response data count: {len(response.data)}")
        return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_client_dashboard(request):
    try:
        # Get client profile from logged-in user
        try:
            client = request.user.client_profile
        except Client.DoesNotExist:
            return Response(
                {'error': 'User is not registered as a client'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get current date
        today = date.today()

        # Get upcoming confirmed bookings
        confirmed_bookings = Booking.objects.filter(
            client=client,
            status='CONFIRMED'
        ).select_related('professional__user')

        upcoming_occurrences = []
        for booking in confirmed_bookings:
            occurrences = BookingOccurrence.objects.filter(
                booking=booking,
                start_date__gte=today,
                status='FINAL'
            ).order_by('start_date', 'start_time')
            upcoming_occurrences.extend(occurrences)

        # Serialize the occurrences
        serialized_occurrences = ClientBookingOccurrenceSerializer(upcoming_occurrences, many=True).data

        # Prepare response data
        response_data = {
            'upcoming_bookings': serialized_occurrences
        }

        return Response(response_data)

    except Exception as e:
        logger.error(f"Error in get_client_dashboard: {str(e)}")
        return Response(
            {'error': 'An error occurred while fetching dashboard data'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 