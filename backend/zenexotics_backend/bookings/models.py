from django.db import models
from django.conf import settings
from clients.models import Client

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled'),
    ]

    SERVICE_CHOICES = [
        ('walking', 'Walking'),
        ('daycare', 'Daycare'),
        ('boarding', 'Boarding'),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='bookings')
    sitter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sitter_bookings')
    service_type = models.CharField(max_length=20, choices=SERVICE_CHOICES)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"Booking {self.id}: {self.client.user.full_name} with {self.sitter.full_name}"
