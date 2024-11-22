from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
import json

def default_dict():
    return "{}"

def default_list():
    return "[]"

class Sitter(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sitter_profile'
    )
    bio = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    average_rating = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)]
    )
    total_reviews = models.PositiveIntegerField(default=0)
    availability = models.TextField(default=default_dict, blank=True)
    services_offered = models.TextField(default=default_list, blank=True)
    animal_types_accepted = models.TextField(default=default_list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    subscribed = models.BooleanField(default=False)

    class Meta:
        db_table = 'sitters'
        ordering = ['-created_at']

    def __str__(self):
        return f"Sitter: {self.user.full_name}"

    def get_availability(self):
        return json.loads(self.availability)

    def set_availability(self, value):
        self.availability = json.dumps(value)

    def get_services_offered(self):
        return json.loads(self.services_offered)

    def set_services_offered(self, value):
        self.services_offered = json.dumps(value)

    def get_animal_types_accepted(self):
        return json.loads(self.animal_types_accepted)

    def set_animal_types_accepted(self, value):
        self.animal_types_accepted = json.dumps(value)