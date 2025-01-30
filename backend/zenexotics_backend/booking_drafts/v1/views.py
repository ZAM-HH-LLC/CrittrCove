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
from decimal import Decimal
from collections import OrderedDict
import json
from rest_framework.renderers import JSONRenderer

logger = logging.getLogger(__name__)

class OrderedDictJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, OrderedDict):
            return {
                '__ordered__': True,
                'items': [[k, self.default(v)] for k, v in obj.items()]
            }
        return super().default(obj)

def ordered_dict_hook(dct):
    if '__ordered__' in dct:
        return OrderedDict(dct['items'])
    return dct

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
                additional_rates.append(OrderedDict([
                    ('title', rate.get('title', '')),
                    ('description', rate.get('description', '')),
                    ('amount', f"${rate.get('amount', '0.00')}")
                ]))
        
        return OrderedDict([
            ('base_rate', base_rate),
            ('additional_animal_rate', additional_animal_rate),
            ('additional_animal_rate_applies', False), # TODO: add the variable additional_animal_rate_applies here.
            ('applies_after', rates.applies_after_animals if hasattr(rates, 'applies_after_animals') else 1),
            ('unit_of_time', rates.time_unit if hasattr(rates, 'time_unit') else "DAY"),
            ('holiday_rate', holiday_rate),
            ('holiday_days', 0),
            ('additional_rates', additional_rates)
        ])
    except Exception as e:
        logger.warning(f"Error serializing rates: {e}")
        return None

def calculate_cost_summary(occurrences):
    """Calculate cost summary from occurrences"""
    try:
        # Calculate subtotal from all occurrences
        subtotal = Decimal('0')
        for occ in occurrences:
            calculated_cost = Decimal(occ.get('calculated_cost', '0'))
            subtotal += calculated_cost

        # Calculate other costs
        platform_fee = (subtotal * Decimal('0.10')).quantize(Decimal('0.01'))
        taxes = ((subtotal + platform_fee) * Decimal('0.08')).quantize(Decimal('0.01'))
        total_client_cost = subtotal + platform_fee + taxes
        total_sitter_payout = (subtotal * Decimal('0.90')).quantize(Decimal('0.01'))

        return OrderedDict([
            ('subtotal', float(subtotal)),
            ('platform_fee', float(platform_fee)),
            ('taxes', float(taxes)),
            ('total_client_cost', float(total_client_cost)),
            ('total_sitter_payout', float(total_sitter_payout)),
            ('is_prorated', True)
        ])
    except Exception as e:
        logger.error(f"Error calculating cost summary: {e}")
        return None

def create_draft_data(booking, request_pets, occurrences, cost_summary):
    """Creates draft data in the exact order required"""
    return OrderedDict([
        ('booking_id', booking.booking_id),
        ('status', booking.status),
        ('client_name', booking.client.user.name),
        ('professional_name', booking.professional.user.name),
        ('service_details', OrderedDict([
            ('service_type', booking.service_id.service_name if booking.service_id else None)
        ])),
        ('pets', [
            OrderedDict([
                ('name', pet.get('name')),
                ('breed', pet.get('breed')),
                ('pet_id', pet.get('pet_id')),
                ('species', pet.get('species'))
            ]) for pet in request_pets
        ]),
        ('occurrences', [
            OrderedDict([
                ('occurrence_id', occ['occurrence_id']),
                ('start_date', occ['start_date']),
                ('end_date', occ['end_date']),
                ('start_time', occ['start_time']),
                ('end_time', occ['end_time']),
                ('calculated_cost', occ['calculated_cost']),
                ('base_total', occ['base_total']),
                ('rates', OrderedDict([
                    ('base_rate', occ['rates']['base_rate']),
                    ('additional_animal_rate', occ['rates']['additional_animal_rate']),
                    ('additional_animal_rate_applies', occ['rates']['additional_animal_rate_applies']),
                    ('applies_after', occ['rates']['applies_after']),
                    ('unit_of_time', occ['rates']['unit_of_time']),
                    ('holiday_rate', occ['rates']['holiday_rate']),
                    ('holiday_days', occ['rates']['holiday_days']),
                    ('additional_rates', [
                        OrderedDict([
                            ('title', rate['title']),
                            ('description', rate['description']),
                            ('amount', rate['amount'])
                        ]) for rate in occ['rates']['additional_rates']
                    ])
                ]))
            ]) for occ in occurrences
        ]),
        ('cost_summary', OrderedDict([
            ('subtotal', cost_summary['subtotal']),
            ('platform_fee', cost_summary['platform_fee']),
            ('taxes', cost_summary['taxes']),
            ('total_client_cost', cost_summary['total_client_cost']),
            ('total_sitter_payout', cost_summary['total_sitter_payout']),
            ('is_prorated', cost_summary['is_prorated'])
        ])),
        ('original_status', booking.status)
    ])

# Views for booking_drafts app will be added here

class BookingDraftUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def patch(self, request, booking_id):
        # Get the booking and verify professional access
        booking = get_object_or_404(Booking, booking_id=booking_id)
        professional = get_object_or_404(Professional, user=request.user)
        if booking.professional != professional:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

        try:
            # Check what type of update we're dealing with
            has_pets = 'pets' in request.data
            has_service = 'service_id' in request.data
            has_occurrences = 'occurrences' in request.data

            # Validate that only one type of update is being made
            update_types = sum([has_pets, has_service, has_occurrences])
            if update_types != 1:
                return Response(
                    {"error": "Request must include exactly one of: pets, service_id, or occurrences"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get or create booking draft
            draft, created = BookingDraft.objects.get_or_create(
                booking=booking,
                defaults={
                    'draft_data': {},
                    'last_modified_by': 'PROFESSIONAL',
                    'status': 'IN_PROGRESS',
                    'original_status': booking.status
                }
            )

            # Load existing draft data or initialize empty
            current_draft_data = draft.draft_data if draft.draft_data else {}

            # Get occurrences data (needed for all cases)
            occurrences = []
            for occurrence in BookingOccurrence.objects.filter(booking=booking):
                try:
                    # Calculate costs for this occurrence
                    booking_details = occurrence.booking_details.first()
                    base_total = booking_details.calculate_occurrence_cost(is_prorated=True) if booking_details else Decimal('0')
                    
                    # Get additional rates and their sum
                    additional_rates = []
                    additional_rates_total = Decimal('0')
                    if hasattr(occurrence, 'rates') and occurrence.rates.rates:
                        for rate in occurrence.rates.rates:
                            if rate['title'] != 'Base Rate':
                                rate_amount = Decimal(rate['amount'].replace('$', '').strip())
                                additional_rates.append(OrderedDict([
                                    ('title', rate['title']),
                                    ('description', rate.get('description', '')),
                                    ('amount', f"${rate_amount}")
                                ]))
                                additional_rates_total += rate_amount

                    # Calculate total cost
                    total_cost = base_total + additional_rates_total

                    # Count number of pets and check if additional animal rate applies
                    num_pets = booking.booking_pets.count()
                    additional_animal_rate_applies = num_pets > booking_details.applies_after if booking_details and booking_details.applies_after else False

                    # Get service (either new one or existing)
                    service = None
                    if has_service:
                        service = get_object_or_404(
                            Service, 
                            service_id=request.data['service_id'],
                            professional=professional,
                            moderation_status='APPROVED'
                        )
                    else:
                        service = booking.service_id

                    # Create occurrence dictionary with ordered fields
                    occurrence_data = OrderedDict([
                        ('occurrence_id', occurrence.occurrence_id),
                        ('start_date', occurrence.start_date.isoformat() if occurrence.start_date else None),
                        ('end_date', occurrence.end_date.isoformat() if occurrence.end_date else None),
                        ('start_time', occurrence.start_time.strftime('%H:%M') if occurrence.start_time else None),
                        ('end_time', occurrence.end_time.strftime('%H:%M') if occurrence.end_time else None),
                        ('calculated_cost', str(total_cost)),
                        ('base_total', f"${base_total}"),
                        ('rates', OrderedDict([
                            ('base_rate', str(booking_details.base_rate) if booking_details else "0.00"),
                            ('additional_animal_rate', str(booking_details.additional_pet_rate) if booking_details else "0.00"),
                            ('additional_animal_rate_applies', additional_animal_rate_applies),
                            ('applies_after', booking_details.applies_after if booking_details else 1),
                            ('unit_of_time', service.unit_of_time if service else "PER_DAY"),
                            ('holiday_rate', str(booking_details.holiday_rate) if booking_details else "0.00"),
                            ('holiday_days', 0),
                            ('additional_rates', additional_rates)
                        ]))
                    ])
                    
                    occurrences.append(occurrence_data)
                except Exception as e:
                    logger.warning(f"Error processing occurrence {occurrence.occurrence_id}: {e}")
                    continue

            # Calculate cost summary
            cost_summary = calculate_cost_summary(occurrences)

            # Determine what pets to use
            pets_data = []
            if has_pets:
                # Use new pets from request
                pets_data = request.data.get('pets', [])
            else:
                # Use existing pets from booking
                live_pets = list(BookingPets.objects.filter(booking=booking).values('pet__pet_id', 'pet__name', 'pet__species', 'pet__breed'))
                pets_data = [
                    OrderedDict([
                        ('name', pet['pet__name']),
                        ('breed', pet['pet__breed']),
                        ('pet_id', pet['pet__pet_id']),
                        ('species', pet['pet__species'])
                    ])
                    for pet in live_pets
                ]

            # Create new draft data
            draft_data = create_draft_data(
                booking=booking,
                request_pets=pets_data,
                occurrences=occurrences,
                cost_summary=cost_summary
            )

            # If updating service, override service details
            if has_service:
                service = get_object_or_404(
                    Service, 
                    service_id=request.data['service_id'],
                    professional=professional,
                    moderation_status='APPROVED'
                )
                draft_data['service_details'] = OrderedDict([
                    ('service_type', service.service_name)
                ])

            # Update draft status if booking is confirmed
            if booking.status == BookingStates.CONFIRMED:
                draft_data['status'] = BookingStates.CONFIRMED_PENDING_PROFESSIONAL_CHANGES
                draft_data['original_status'] = booking.status

            # Convert to JSON string maintaining order
            draft_json = json.dumps(draft_data, cls=OrderedDictJSONEncoder)
            
            # Update the draft
            draft.draft_data = json.loads(draft_json, object_hook=ordered_dict_hook)
            draft.save()

            return Response({
                'status': 'success',
                'booking_status': draft_data['status']
            })

        except Exception as e:
            logger.error(f"Error in BookingDraftUpdateView: {e}")
            return Response(
                {"error": "An error occurred while updating the booking draft"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
            OrderedDict([
                ('name', pet.name),
                ('breed', pet.breed),
                ('pet_id', pet.pet_id),
                ('species', pet.species)
            ])
            for pet in client_pets
        ]

        return Response(pets_data)
