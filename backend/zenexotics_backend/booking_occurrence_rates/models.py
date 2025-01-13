from django.db import models

class BookingOccurrenceRate(models.Model):
    occurrence_rate_id = models.AutoField(primary_key=True)
    occurrence = models.ForeignKey('booking_occurrences.BookingOccurrence', on_delete=models.CASCADE, related_name='rates')
    rate_title = models.CharField(max_length=255)
    rate_amount = models.DecimalField(max_digits=10, decimal_places=2)
    rate_description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.rate_title} for Occurrence {self.occurrence.occurrence_id}"

    class Meta:
        db_table = 'booking_occurrence_rates'
        ordering = ['created_at']
