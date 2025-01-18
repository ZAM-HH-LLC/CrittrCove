from rest_framework import serializers
from .models import Professional
from bookings.models import Booking
from booking_occurrences.models import BookingOccurrence
from pets.models import Pet

class PetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pet
        fields = ['name', 'species']

class BookingOccurrenceSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='booking.client.user.name')
    service_type = serializers.CharField(source='booking.service_type')
    pets = serializers.SerializerMethodField()
    
    class Meta:
        model = BookingOccurrence
        fields = ['booking_id', 'client_name', 'start_date', 'start_time', 'service_type', 'pets']
    
    def get_pets(self, obj):
        pets = Pet.objects.filter(bookingpets__booking=obj.booking)
        return PetSerializer(pets, many=True).data

class ProfessionalDashboardSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.get_first_name')
    upcoming_bookings = BookingOccurrenceSerializer(many=True, read_only=True)

    class Meta:
        model = Professional
        fields = [
            'first_name',
            'upcoming_bookings'
        ] 