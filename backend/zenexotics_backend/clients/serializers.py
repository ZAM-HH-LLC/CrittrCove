from rest_framework import serializers
from .models import Client
from bookings.models import Booking
from booking_occurrences.models import BookingOccurrence
from pets.models import Pet
import logging

logger = logging.getLogger(__name__)

class PetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pet
        fields = ['name', 'species']

class ClientBookingOccurrenceSerializer(serializers.ModelSerializer):
    professional_name = serializers.CharField(source='booking.professional.user.name')
    service_type = serializers.CharField(source='booking.service_type')
    pets = serializers.SerializerMethodField()
    
    class Meta:
        model = BookingOccurrence
        fields = ['booking_id', 'professional_name', 'start_date', 'start_time', 'service_type', 'pets']
    
    def get_pets(self, obj):
        pets = Pet.objects.filter(bookingpets__booking=obj.booking)
        return PetSerializer(pets, many=True).data

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
