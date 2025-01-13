from django.db import models

class BookingOccurrence(models.Model):
    CREATOR_CHOICES = [
        ('CLIENT', 'Client'),
        ('PROFESSIONAL', 'Professional'),
    ]

    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('FINAL', 'Final'),
    ]

    occurrence_id = models.AutoField(primary_key=True)
    booking = models.ForeignKey('bookings.Booking', on_delete=models.CASCADE, related_name='occurrences')
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    calculated_cost = models.DecimalField(max_digits=10, decimal_places=2)
    created_by = models.CharField(max_length=50, choices=CREATOR_CHOICES)
    last_modified_by = models.CharField(max_length=50, choices=CREATOR_CHOICES)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Occurrence for Booking {self.booking.booking_id} on {self.start_date}"

    class Meta:
        db_table = 'booking_occurrences'
        ordering = ['start_date', 'start_time']
