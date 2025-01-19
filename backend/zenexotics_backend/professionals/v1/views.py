from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import date
from ..models import Professional
from ..serializers import ProfessionalDashboardSerializer, BookingOccurrenceSerializer
from bookings.models import Booking
from booking_occurrences.models import BookingOccurrence
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_professional_dashboard(request):
    try:
        # Get professional profile from logged-in user
        try:
            professional = request.user.professional_profile
        except Professional.DoesNotExist:
            return Response(
                {'error': 'User is not registered as a professional'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get current date
        today = date.today()

        # Get upcoming confirmed bookings
        confirmed_bookings = Booking.objects.filter(
            professional=professional,
            status='CONFIRMED'
        ).select_related('client__user')

        upcoming_occurrences = []
        for booking in confirmed_bookings:
            occurrences = BookingOccurrence.objects.filter(
                booking=booking,
                start_date__gte=today,
                status='FINAL'
            ).order_by('start_date', 'start_time')
            upcoming_occurrences.extend(occurrences)

        # Serialize the occurrences
        serialized_occurrences = BookingOccurrenceSerializer(upcoming_occurrences, many=True).data

        # Prepare response data
        response_data = {
            'upcoming_bookings': serialized_occurrences
        }

        return Response(response_data)

    except Exception as e:
        logger.error(f"Error in get_professional_dashboard: {str(e)}")
        return Response(
            {'error': 'An error occurred while fetching dashboard data'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
