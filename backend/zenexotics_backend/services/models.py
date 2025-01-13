from django.db import models
from django.contrib.postgres.fields import ArrayField

class Service(models.Model):
    ANIMAL_TYPE_CHOICES = [
        ('DOG', 'Dog'),
        ('CAT', 'Cat'),
        ('EXOTIC', 'Exotic'),
        ('FARM', 'Farm Animal'),
        ('OTHER', 'Other'),
    ]

    MODERATION_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    UNIT_OF_TIME_CHOICES = [
        ('15_MIN', '15 Minutes'),
        ('30_MIN', '30 Minutes'),
        ('1_HOUR', '1 Hour'),
        ('DAY', 'Day'),
        ('WEEK', 'Week'),
    ]

    service_id = models.AutoField(primary_key=True)
    professional = models.ForeignKey('professionals.Professional', on_delete=models.CASCADE)
    service_name = models.CharField(max_length=255)
    description = models.TextField()
    animal_type = models.CharField(max_length=50, choices=ANIMAL_TYPE_CHOICES)
    categories = ArrayField(models.CharField(max_length=100), blank=True)
    base_rate = models.DecimalField(max_digits=10, decimal_places=2)
    additional_animal_rate = models.DecimalField(max_digits=10, decimal_places=2)
    holiday_rate = models.DecimalField(max_digits=10, decimal_places=2)
    unit_of_time = models.CharField(max_length=50, choices=UNIT_OF_TIME_CHOICES)
    moderation_status = models.CharField(
        max_length=50, 
        choices=MODERATION_STATUS_CHOICES,
        default='PENDING'
    )
    moderation_notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    searchable = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.service_name} by {self.professional}"

    class Meta:
        db_table = 'services'
        ordering = ['-created_at']
