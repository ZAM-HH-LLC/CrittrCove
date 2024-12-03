from rest_framework import serializers
from .models import Client
import logging

logger = logging.getLogger(__name__)

class ClientSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'email', 'about_me',
            'emergency_contact_name', 'emergency_contact_phone',
            'authorized_household_members', 'last_booking', 'created_at'
        ]
