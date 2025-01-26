from rest_framework import serializers
from .models import Booking
from pets.models import Pet
from decimal import Decimal

class BookingListSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    professional_name = serializers.SerializerMethodField()
    service_name = serializers.SerializerMethodField()
    start_date = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'booking_id',
            'client_name',
            'professional_name',
            'service_name',
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
    
    def get_service_name(self, obj):
        return obj.service_id.service_name if obj.service_id else None
    
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
    service_name = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'booking_id',
            'status',
            'service_name',
            'parties',
            'pets',
            'service_details',
            'occurrences',
            'cost_summary'
        ]

    def get_service_name(self, obj):
        return obj.service_id.service_name if obj.service_id else None

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
        if not obj.service_id:
            return None
        
        service = obj.service_id
        details = obj.booking_details.first()
        
        return {
            'service_type': service.service_name,
            'animal_type': service.animal_type,
            'num_pets': details.num_pets if details else len(self.get_pets(obj)),
        }

    def get_occurrences(self, obj):
        occurrences = obj.occurrences.all().order_by('start_date', 'start_time')
        is_prorated = self.context.get('is_prorated', True)
        
        def get_time_unit_info(occurrence):
            if not hasattr(occurrence.booking, 'service_id'):
                return None
                
            multiple = occurrence.calculate_time_units(is_prorated)
            if multiple is not None:
                return {
                    'multiple': float(multiple),
                    'unit': occurrence.booking.service_id.unit_of_time
                }
            return None
        
        return [{
            'start_date': occurrence.start_date,
            'end_date': occurrence.end_date,
            'start_time': occurrence.start_time,
            'end_time': occurrence.end_time,
            'calculated_cost': f"${float(occurrence.calculated_cost(is_prorated)):.2f}",
            'rates': occurrence.rates.rates if hasattr(occurrence, 'rates') and occurrence.rates else [],
            'time_units': get_time_unit_info(occurrence)
        } for occurrence in occurrences]

    def get_cost_summary(self, obj):
        try:
            summary = obj.bookingsummary
            if summary:
                # Calculate total from all occurrences
                is_prorated = self.context.get('is_prorated', True)
                total = sum(
                    occurrence.calculated_cost(is_prorated)
                    for occurrence in obj.occurrences.all()
                )
                
                # Calculate fees and taxes based on the new total
                platform_fee = total * (summary.fee_percentage / Decimal('100.00'))
                taxes = (total + platform_fee) * (summary.tax_percentage / Decimal('100.00'))
                total_client_cost = total + platform_fee + taxes
                total_sitter_payout = total - platform_fee
                
                return {
                    'subtotal': float(total),
                    'platform_fee': float(platform_fee),
                    'taxes': float(taxes),
                    'total_client_cost': float(total_client_cost),
                    'total_sitter_payout': float(total_sitter_payout)
                }
        except:
            return None
        return None 