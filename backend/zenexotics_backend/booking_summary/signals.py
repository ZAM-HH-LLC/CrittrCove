from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Sum
from decimal import Decimal
from booking_occurrences.models import BookingOccurrence
from .models import BookingSummary

@receiver(post_save, sender=BookingOccurrence)
def update_booking_summary(sender, instance, created, **kwargs):
    """
    Signal handler to update or create booking summary when a booking occurrence is saved.
    Calculates totals based on all occurrences for the booking.
    """
    booking = instance.booking
    
    # Get the sum of all occurrence costs for this booking
    total_occurrence_costs = BookingOccurrence.objects.filter(
        booking=booking,
        status='FINAL'  # Only count finalized occurrences
    ).aggregate(total=Sum('calculated_cost'))['total'] or Decimal('0.00')
    
    # Set fee and tax percentages
    fee_percentage = Decimal('0.10')  # 10% platform fee
    tax_percentage = Decimal('0.08')  # 8% tax
    
    # Calculate all components
    subtotal = total_occurrence_costs
    client_fee = subtotal * fee_percentage
    taxes = subtotal * tax_percentage
    total_client_cost = subtotal + client_fee + taxes
    total_sitter_payout = subtotal - (subtotal * fee_percentage)
    
    # Update or create the booking summary
    summary, created = BookingSummary.objects.update_or_create(
        booking=booking,
        defaults={
            'subtotal': subtotal,
            'client_fee': client_fee,
            'taxes': taxes,
            'total_client_cost': total_client_cost,
            'total_sitter_payout': total_sitter_payout,
            'fee_percentage': fee_percentage * 100,  # Store as percentage (10.00)
            'tax_percentage': tax_percentage * 100,  # Store as percentage (8.00)
        }
    )
    
    # Update the booking's financial fields as well
    booking.subtotal = subtotal
    booking.total_client_cost = total_client_cost
    booking.total_sitter_payout = total_sitter_payout
    booking.save(update_fields=['subtotal', 'total_client_cost', 'total_sitter_payout']) 