from django.db import models

class Booking(models.Model):
    BOOKING_STATUS_CHOICES = [
        ('PENDING_INITIAL_PROFESSIONAL_CHANGES', 'Pending Initial Professional Changes'),
        ('PENDING_PROFESSIONAL_CHANGES', 'Pending Professional Changes'),
        ('PENDING_CLIENT_APPROVAL', 'Pending Client Approval'),
        ('CONFIRMED_PENDING_PROFESSIONAL_CHANGES', 'Confirmed Pending Professional Changes'),
        ('CONFIRMED', 'Confirmed'),
        ('DENIED', 'Denied'),
        ('CANCELLED', 'Cancelled'),
        ('DRAFT', 'Draft'),
    ]

    booking_id = models.AutoField(primary_key=True)
    client = models.ForeignKey('clients.Client', on_delete=models.CASCADE)
    professional = models.ForeignKey('professionals.Professional', on_delete=models.CASCADE)
    service_id = models.ForeignKey('services.Service', on_delete=models.PROTECT, null=True, related_name='bookings', db_column='service_type_id')
    status = models.CharField(max_length=100, choices=BOOKING_STATUS_CHOICES)
    initiated_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='initiated_bookings')
    cancelled_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='cancelled_bookings')
    last_modified_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='modified_bookings')
    denied_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='denied_bookings')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking {self.booking_id} - {self.client} with {self.professional}"

    class Meta:
        db_table = 'bookings'
        ordering = ['-created_at']
