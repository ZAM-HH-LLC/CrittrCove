from rest_framework import serializers
from .models import Booking
from pets.models import Pet

class BookingListSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    professional_name = serializers.SerializerMethodField()
    start_date = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'booking_id',
            'client_name',
            'professional_name',
            'service_type',
            'start_date',
            'start_time',
            'total_client_cost',
            'total_sitter_payout',
            'status'
        ]

    def get_client_name(self, obj):
        return obj.client.user.name if obj.client else None

    def get_professional_name(self, obj):
        return obj.professional.user.name if obj.professional else None
    
    def get_start_date(self, obj):
        # Get the first occurrence for this booking
        first_occurrence = obj.occurrences.order_by('start_date', 'start_time').first()
        return first_occurrence.start_date if first_occurrence else None
    
    def get_start_time(self, obj):
        # Get the first occurrence for this booking
        first_occurrence = obj.occurrences.order_by('start_date', 'start_time').first()
        return first_occurrence.start_time if first_occurrence else None 

class PetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pet
        fields = ['name', 'species']

class BookingDetailSerializer(serializers.ModelSerializer):
    parties = serializers.SerializerMethodField()
    pets = serializers.SerializerMethodField()
    service_details = serializers.SerializerMethodField()
    occurrences = serializers.SerializerMethodField()
    cost_summary = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'booking_id',
            'status',
            'service_type',
            'parties',
            'pets',
            'service_details',
            'occurrences',
            'cost_summary'
        ]

    def get_parties(self, obj):
        return {
            'client_name': obj.client.user.name,
            'client_id': obj.client.id,
            'professional_name': obj.professional.user.name,
            'professional_id': obj.professional.professional_id
        }

    def get_pets(self, obj):
        pets = Pet.objects.filter(bookingpets__booking=obj)
        return PetSerializer(pets, many=True).data

    def get_service_details(self, obj):
        details = obj.booking_details.first()
        if details:
            return {
                'base_rate': float(details.base_rate),
                'additional_pet_rate': float(details.additional_pet_rate),
                'num_pets': details.num_pets
            }
        return None

    def get_occurrences(self, obj):
        occurrences = obj.occurrences.all().order_by('start_date', 'start_time')
        return [{
            'start_date': occurrence.start_date,
            'start_time': occurrence.start_time,
            'end_time': occurrence.end_time
        } for occurrence in occurrences]

    def get_cost_summary(self, obj):
        summary = obj.summary
        if summary:
            return {
                'subtotal': float(summary.subtotal),
                'client_fee': float(summary.client_fee),
                'total_client_cost': float(summary.total_client_cost),
                'sitter_payout': float(summary.total_sitter_payout)
            }
        return None 