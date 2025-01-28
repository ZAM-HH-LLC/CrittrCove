from django.shortcuts import render
import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from bookings.models import Booking
from booking_pets.models import BookingPets
from booking_drafts.models import BookingDraft
from pets.models import Pet
from professionals.models import Professional
from bookings.constants import BookingStates
from services.models import Service
from booking_occurrences.models import BookingOccurrence

logger = logging.getLogger(__name__)

def serialize_rates(rates):
    """Safely serialize rates, handling cases where rates don't exist"""
    try:
        if not rates:
            return None
        
        # Get the base rates
        base_rate = str(rates.base_rate) if hasattr(rates, 'base_rate') else "0.00"
        additional_animal_rate = str(rates.additional_animal_rate) if hasattr(rates, 'additional_animal_rate') else "0.00"
        holiday_rate = str(rates.holiday_rate) if hasattr(rates, 'holiday_rate') else "0.00"
        
        # Format additional rates
        additional_rates = []
        if hasattr(rates, 'rates') and rates.rates:
            for rate in rates.rates:
                additional_rates.append({
                    'title': rate.get('title', ''),
                    'amount': f"${rate.get('amount', '0.00')}",
                    'description': rate.get('description', '')
                })
        
        return {
            'base_rate': base_rate,
            'additional_animal_rate': additional_animal_rate,
            'applies_after': rates.applies_after_animals if hasattr(rates, 'applies_after_animals') else 1,
            'unit_of_time': rates.time_unit if hasattr(rates, 'time_unit') else "DAY",
            'holiday_rate': holiday_rate,
            'additional_rates': additional_rates
        }
    except Exception as e:
        logger.warning(f"Error serializing rates: {e}")
        return None

# Views for booking_drafts app will be added here

class BookingDraftUpdatePetsView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, booking_id):
        # Get the booking and verify professional access
        booking = get_object_or_404(Booking, booking_id=booking_id)
        professional = get_object_or_404(Professional, user=request.user)
        if booking.professional != professional:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

        # Get service details using service_id field
        service_details = {
            'service_type': booking.service_id.service_name if booking.service_id else None,
            'animal_type': booking.service_id.animal_type if booking.service_id else "OTHER",
            'num_pets': len(BookingPets.objects.filter(booking=booking))
        }

        # Get occurrences and format dates/times as strings
        occurrences = []
        for occurrence in BookingOccurrence.objects.filter(booking=booking):
            try:
                rates = occurrence.rates if hasattr(occurrence, 'rates') else None
                occurrences.append({
                    'occurrence_id': occurrence.occurrence_id,
                    'start_date': occurrence.start_date.isoformat() if occurrence.start_date else None,
                    'end_date': occurrence.end_date.isoformat() if occurrence.end_date else None,
                    'start_time': occurrence.start_time.strftime('%H:%M') if occurrence.start_time else None,
                    'end_time': occurrence.end_time.strftime('%H:%M') if occurrence.end_time else None,
                    'calculated_cost': str(occurrence.booking_details.first().calculate_occurrence_cost(is_prorated=True)) if occurrence.booking_details.first() else "0.00",
                    'base_total': f"${occurrence.booking_details.first().calculate_occurrence_cost(is_prorated=True)}" if occurrence.booking_details.first() else "$0.00",
                    'rates': serialize_rates(rates)
                })
            except Exception as e:
                logger.warning(f"Error processing occurrence {occurrence.occurrence_id}: {e}")
                continue

        # Get or create booking draft
        draft, created = BookingDraft.objects.get_or_create(
            booking=booking,
            defaults={
                'draft_data': {
                    'pets': [],
                    'service_details': service_details,
                    'occurrences': occurrences,
                    'original_status': booking.status  # Store original status when creating draft
                }
            }
        )

        # If draft exists but doesn't have original_status, add it
        if not created and not draft.original_status:
            draft.original_status = booking.status
            draft.save()

        # Update pets in draft_data
        draft.draft_data['pets'] = request.data.get('pets', [])
        draft.save()

        # Compare draft pets with live booking pets
        live_pets = list(BookingPets.objects.filter(booking=booking).values('pet__pet_id', 'pet__name', 'pet__species', 'pet__breed'))
        draft_pets = draft.draft_data.get('pets', [])

        # Transform live_pets to match draft_pets format for comparison
        formatted_live_pets = [
            {
                'pet_id': pet['pet__pet_id'],
                'name': pet['pet__name'],
                'species': pet['pet__species'],
                'breed': pet['pet__breed']
            }
            for pet in live_pets
        ]

        logger.info(f"Comparing pets for booking {booking_id}:")
        logger.info(f"Live pets: {formatted_live_pets}")
        logger.info(f"Draft pets: {draft_pets}")
        logger.info(f"Current booking status: {booking.status}")

        # Update booking status based on comparison
        new_status = None
        if sorted(formatted_live_pets, key=lambda x: x['pet_id']) != sorted(draft_pets, key=lambda x: x['pet_id']):
            new_status = BookingStates.CONFIRMED_PENDING_PROFESSIONAL_CHANGES
            booking.status = new_status
            booking.save()
        else:
            # If pets match, revert to original status
            original_status = draft.draft_data.get('original_status')
            if original_status and booking.status == BookingStates.CONFIRMED_PENDING_PROFESSIONAL_CHANGES:
                booking.status = original_status
                booking.save()
                new_status = original_status

        return Response({
            'status_code': status.HTTP_200_OK,
            'booking_status': new_status
        })

class AvailablePetsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        # Get the booking and verify professional access
        booking = get_object_or_404(Booking, booking_id=booking_id)
        professional = get_object_or_404(Professional, user=request.user)
        if booking.professional != professional:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

        # Get all pets for the client
        client_pets = Pet.objects.filter(owner=booking.client.user)

        # Format the response
        pets_data = [
            {
                'pet_id': pet.pet_id,
                'name': pet.name,
                'species': pet.species,
                'breed': pet.breed
            }
            for pet in client_pets
        ]

        return Response(pets_data)