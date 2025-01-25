from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import date
from ..models import Professional
from ..serializers import ProfessionalDashboardSerializer, BookingOccurrenceSerializer, ClientProfessionalProfileSerializer
from bookings.models import Booking
from booking_occurrences.models import BookingOccurrence
import logging

# Configure logging to print to console
logger = logging.getLogger(__name__)
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)
logger.setLevel(logging.DEBUG)

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_professional_client_view(request, professional_id):
    logger.debug(f"Client view endpoint called for professional_id: {professional_id}")
    logger.debug(f"Request user: {request.user.id}")
    
    try:
        # Check if the user is either a client or a professional
        is_client = hasattr(request.user, 'client_profile')
        is_professional = hasattr(request.user, 'professional_profile')
        logger.debug(f"User permissions - is_client: {is_client}, is_professional: {is_professional}")
        
        if not (is_client or is_professional):
            logger.warning(f"User {request.user.id} attempted to access client view without proper role")
            return Response(
                {'error': 'User must be a client or professional to view this information'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get professional profile
        try:
            professional = Professional.objects.get(professional_id=professional_id)
            logger.debug(f"Found professional: {professional.professional_id}")
        except Professional.DoesNotExist:
            logger.warning(f"Professional with ID {professional_id} not found")
            return Response(
                {'error': 'Professional not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Serialize the professional data
        logger.debug("Serializing professional data")
        serializer = ClientProfessionalProfileSerializer(professional)
        logger.debug("Successfully serialized professional data")
        return Response(serializer.data)

    except Exception as e:
        logger.error(f"Error in get_professional_client_view: {str(e)}")
        logger.exception("Full traceback:")
        return Response(
            {'error': 'An error occurred while fetching professional data'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
