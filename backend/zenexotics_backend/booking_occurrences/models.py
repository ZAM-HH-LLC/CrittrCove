from django.db import models
from decimal import Decimal
from datetime import datetime

class BookingOccurrence(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]

    CREATOR_CHOICES = [
        ('CLIENT', 'Client'),
        ('PROFESSIONAL', 'Professional'),
    ]

    occurrence_id = models.AutoField(primary_key=True)
    booking = models.ForeignKey('bookings.Booking', on_delete=models.CASCADE, related_name='occurrences')
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_by = models.CharField(max_length=50, choices=CREATOR_CHOICES)
    last_modified_by = models.CharField(max_length=50, choices=CREATOR_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'booking_occurrences'
        verbose_name = 'Booking Occurrence'
        verbose_name_plural = 'Booking Occurrences'
        ordering = ['start_date', 'start_time']

    def __str__(self):
        return f"Occurrence {self.occurrence_id} for Booking {self.booking.booking_id}"

    def calculate_time_units(self, is_prorated=True):
        """Calculate the number of time units for this occurrence"""
        try:
            if hasattr(self.booking, 'service_id'):
                service = self.booking.service_id
                start_datetime = datetime.combine(self.start_date, self.start_time)
                end_datetime = datetime.combine(self.end_date, self.end_time)
                duration_hours = (end_datetime - start_datetime).total_seconds() / 3600
                
                if service.unit_of_time == 'PER_DAY':
                    multiple = duration_hours / 24
                elif service.unit_of_time == 'WEEK':
                    multiple = duration_hours / (24 * 7)
                elif service.unit_of_time == '1_HOUR':
                    multiple = duration_hours
                elif service.unit_of_time == '30_MIN':
                    multiple = duration_hours * 2
                elif service.unit_of_time == '15_MIN':
                    multiple = duration_hours * 4
                else:
                    return None
                
                if is_prorated:
                    return Decimal(str(multiple)).quantize(Decimal('0.001'))
                else:
                    return Decimal(str(round(multiple)))
        except (AttributeError, KeyError):
            pass
        return None

    def calculate_base_rate_cost(self, is_prorated=True):
        """Calculate the cost for the base rate considering time units"""
        try:
            if hasattr(self, 'rates') and self.rates.rates:
                base_rate = next(
                    (rate for rate in self.rates.rates if rate['title'] == 'Base Rate'),
                    None
                )
                if base_rate:
                    multiple = self.calculate_time_units(is_prorated)
                    if multiple is not None:
                        base_amount = Decimal(base_rate['amount'].replace('$', '').strip())
                        return base_amount * multiple
        except (AttributeError, KeyError):
            pass
        return Decimal('0.00')

    def calculated_cost(self, is_prorated=True):
        """Calculate total cost from all rates in the JSON array, accounting for duration"""
        try:
            if hasattr(self, 'rates') and self.rates.rates:
                total = Decimal('0.00')
                
                # Calculate base rate cost with time units
                base_rate_cost = self.calculate_base_rate_cost(is_prorated)
                total += base_rate_cost
                
                # Add other rates as-is
                for rate in self.rates.rates:
                    if rate['title'] != 'Base Rate':
                        amount = Decimal(rate['amount'].replace('$', '').strip())
                        total += amount
                
                return total.quantize(Decimal('0.01'))
        except (AttributeError, KeyError):
            pass
        return Decimal('0.00')
