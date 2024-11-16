from django.db import models
from django.conf import settings

# Create your models here.

class Client(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    sitter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='clients'
    )
    last_booking = models.DateField(null=True, blank=True)
    pet_types = models.JSONField(default=list)  # Store pet types as a list

    def __str__(self):
        return self.name
