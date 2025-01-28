from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from booking_pets.models import BookingPets
from .models import BookingDetails
from decimal import Decimal

@receiver([post_save], sender=BookingDetails)
def update_occurrence_rates(sender, instance, created, **kwargs):
    """
    Signal handler to update the BookingOccurrence rates when BookingDetails changes
    """
    occurrence = instance.booking_occurrence
    
    # Calculate the cost using the BookingDetails logic
    booking_details_cost = instance.calculate_occurrence_cost(is_prorated=True)
    
    # Get existing rates or create new ones
    if hasattr(occurrence, 'rates'):
        rates = occurrence.rates.rates or []
    else:
        from booking_occurrence_rates.models import BookingOccurrenceRates
        rates_obj = BookingOccurrenceRates.objects.create(
            booking_occurrence=occurrence,
            rates=[]
        )
        rates = []

    # Update or add the booking details cost as a rate
    booking_details_rate = {
        'title': 'Booking Details Cost',
        'description': 'Prorated cost including base rate, additional animal rate, and holiday rate if applicable',
        'amount': str(booking_details_cost)
    }

    # Remove old booking details cost if it exists
    rates = [r for r in rates if r.get('title') != 'Booking Details Cost']
    rates.append(booking_details_rate)

    # Save the updated rates
    occurrence.rates.rates = rates
    occurrence.rates.save()

@receiver([post_save, post_delete], sender=BookingPets)
def update_booking_num_pets(sender, instance, **kwargs):
    """
    Signal handler to update the num_pets field in BookingDetails when pets are added or removed
    """
    booking = instance.booking
    # Update num_pets for all BookingDetails associated with this booking's occurrences
    for occurrence in booking.occurrences.all():
        booking_details = occurrence.booking_details.first()
        if booking_details:
            num_pets = booking.booking_pets.count()
            booking_details.num_pets = num_pets
            booking_details.save() 