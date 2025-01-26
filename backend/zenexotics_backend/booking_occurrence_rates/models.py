from django.db import models
from django.core.serializers.json import DjangoJSONEncoder
from decimal import Decimal

class BookingOccurrenceRate(models.Model):
    """Model for storing multiple rates as JSON for each booking occurrence"""
    occurrence_rate_id = models.AutoField(primary_key=True)
    occurrence = models.OneToOneField(
        'booking_occurrences.BookingOccurrence',
        on_delete=models.CASCADE,
        related_name='rates'
    )
    rates = models.JSONField(
        default=list,
        help_text='List of rates with title, description, and amount',
        encoder=DjangoJSONEncoder
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'booking_occurrence_rates'
        verbose_name = 'Booking Occurrence Rate'
        verbose_name_plural = 'Booking Occurrence Rates'

    def __str__(self):
        return f"Rates for {self.occurrence}"

    def get_total(self):
        """Calculate total from all rates"""
        total = Decimal('0.00')
        for rate in self.rates:
            # Remove '$' and convert to Decimal
            amount = Decimal(rate['amount'].replace('$', '').strip())
            total += amount
        return total

    def clean(self):
        """Validate the rates JSON structure"""
        from django.core.exceptions import ValidationError
        
        if not isinstance(self.rates, list):
            raise ValidationError({'rates': 'Rates must be a list'})
        
        for rate in self.rates:
            if not isinstance(rate, dict):
                raise ValidationError({'rates': 'Each rate must be an object'})
            
            required_fields = {'title', 'description', 'amount'}
            missing_fields = required_fields - set(rate.keys())
            
            if missing_fields:
                raise ValidationError({
                    'rates': f'Rate is missing required fields: {", ".join(missing_fields)}'
                })
            
            # Validate amount format
            amount = rate['amount']
            if not isinstance(amount, str) or not amount.startswith('$'):
                raise ValidationError({
                    'rates': f'Amount must be a string starting with $'
                })
            
            try:
                # Try to convert amount to Decimal (removing $ first)
                Decimal(amount.replace('$', '').strip())
            except:
                raise ValidationError({
                    'rates': f'Invalid amount format: {amount}'
                })
