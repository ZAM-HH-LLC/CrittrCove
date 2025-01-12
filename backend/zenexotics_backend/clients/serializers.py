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
            'client_id', 'name', 'email', 'about_me',
            'emergency_contact', 'authorized_household_members',
            'last_booking', 'verified_payment_method',
            'created_at'
        ]
