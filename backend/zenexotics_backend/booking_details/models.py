from django.db import models

class BookingDetails(models.Model):
    PET_TYPE_CHOICES = [
        ('Dog', 'Dog'),
        ('Cat', 'Cat'),
        ('Exotic', 'Exotic'),
        ('Farm', 'Farm Animal'),
        ('Other', 'Other'),
    ]

    detail_id = models.AutoField(primary_key=True)
    booking = models.ForeignKey('bookings.Booking', on_delete=models.CASCADE, related_name='booking_details')
    pet_type = models.CharField(max_length=50, choices=PET_TYPE_CHOICES)
    num_pets = models.PositiveIntegerField()
    base_rate = models.DecimalField(max_digits=10, decimal_places=2)
    additional_pet_rate = models.DecimalField(max_digits=10, decimal_places=2)
    calculated_rate = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.num_pets} {self.pet_type}(s) for Booking {self.booking.booking_id}"

    class Meta:
        db_table = 'booking_details'
        unique_together = ('booking', 'pet_type')
        verbose_name_plural = 'booking details'
