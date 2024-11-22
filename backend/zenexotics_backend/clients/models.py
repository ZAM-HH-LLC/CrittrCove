from django.db import models
from django.conf import settings
import json

def default_list():
    return "[]"

class Client(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='client_profile'
    )
    address = models.TextField(blank=True)
    about_me = models.TextField(blank=True)
    emergency_contact_name = models.CharField(max_length=255, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    authorized_household_members = models.TextField(default=default_list, blank=True)
    pet_types = models.TextField(default=default_list, blank=True)
    last_booking = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Client: {self.user.full_name}"

    def save(self, *args, **kwargs):
        # Ensure pet_types is valid JSON
        if not self.pet_types or self.pet_types == '':
            self.pet_types = '[]'
        try:
            json.loads(self.pet_types)
        except json.JSONDecodeError:
            self.pet_types = '[]'
        super().save(*args, **kwargs)

    def get_pet_types(self):
        try:
            if not self.pet_types or self.pet_types == '':
                return []
            return json.loads(self.pet_types)
        except json.JSONDecodeError:
            return []

    def set_pet_types(self, value):
        self.pet_types = json.dumps(value)
