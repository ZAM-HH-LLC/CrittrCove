from rest_framework import serializers
from .models import Client
import logging

logger = logging.getLogger(__name__)

class ClientSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.full_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    pet_types = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'email', 'address', 'about_me',
            'emergency_contact_name', 'emergency_contact_phone',
            'pet_types', 'last_booking', 'created_at'
        ]

    def get_pet_types(self, obj):
        try:
            return obj.get_pet_types()
        except Exception as e:
            logger.error(f"Error getting pet types for client {obj.id}: {str(e)}")
            return []
