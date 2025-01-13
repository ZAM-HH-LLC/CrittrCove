from django.db import models

class BookingSummary(models.Model):
    summary_id = models.AutoField(primary_key=True)
    booking = models.OneToOneField('bookings.Booking', on_delete=models.CASCADE, related_name='summary')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    client_fee = models.DecimalField(max_digits=10, decimal_places=2)
    taxes = models.DecimalField(max_digits=10, decimal_places=2)
    total_client_cost = models.DecimalField(max_digits=10, decimal_places=2)
    total_sitter_payout = models.DecimalField(max_digits=10, decimal_places=2)
    fee_percentage = models.DecimalField(max_digits=5, decimal_places=2)  # e.g., 10.00 for 10%
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2)  # e.g., 8.00 for 8%

    def __str__(self):
        return f"Summary for Booking {self.booking.booking_id}"

    class Meta:
        db_table = 'booking_summary'
        verbose_name_plural = 'booking summaries'
