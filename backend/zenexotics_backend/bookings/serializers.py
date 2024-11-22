from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.user.full_name', read_only=True)
    sitter_name = serializers.CharField(source='sitter.full_name', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'client', 'client_name', 'sitter', 'sitter_name',
            'service_type', 'start_date', 'end_date', 'status',
            'total_price', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
