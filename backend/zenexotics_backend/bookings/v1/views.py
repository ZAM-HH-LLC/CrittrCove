from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.shortcuts import get_object_or_404
from clients.models import Client
from professionals.models import Professional
from ..models import Booking
from ..serializers import BookingListSerializer, BookingDetailSerializer
from rest_framework import generics

class BookingPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_next_link(self):
        if not self.page.has_next():
            return None
        return f"/api/bookings/v1/?page={self.page.next_page_number()}"

class BookingListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = BookingPagination

    def get(self, request):
        user = request.user
        
        # Try to get client and professional profiles for the user
        try:
            client = Client.objects.get(user=user)
            is_client = True
        except Client.DoesNotExist:
            is_client = False
            client = None

        try:
            professional = Professional.objects.get(user=user)
            is_professional = True
        except Professional.DoesNotExist:
            is_professional = False
            professional = None

        # Get professional bookings
        professional_bookings = []
        if is_professional:
            prof_bookings = Booking.objects.filter(professional=professional).select_related(
                'client__user',
                'professional__user',
                'bookingsummary'
            ).prefetch_related(
                'occurrences'
            ).order_by('-created_at')
            professional_bookings = BookingListSerializer(prof_bookings, many=True).data

        # Get client bookings
        client_bookings = []
        if is_client:
            cli_bookings = Booking.objects.filter(client=client).select_related(
                'client__user',
                'professional__user',
                'bookingsummary'
            ).prefetch_related(
                'occurrences'
            ).order_by('-created_at')
            client_bookings = BookingListSerializer(cli_bookings, many=True).data

        # Return response with separated bookings
        return Response({
            'bookings': {
                'professional_bookings': professional_bookings,
                'client_bookings': client_bookings
            },
            'next_page': None  # Since we're not paginating the separated lists
        })

class BookingDetailView(generics.RetrieveAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'booking_id'
    lookup_url_kwarg = 'booking_id'

    def get_queryset(self):
        return Booking.objects.select_related(
            'service_id',
            'client',
            'professional',
            'bookingsummary'
        ).prefetch_related(
            'booking_pets__pet',
            'occurrences',
            'occurrences__rates'
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Get is_prorated from query params, default to True if not provided
        context['is_prorated'] = self.request.query_params.get('is_prorated', 'true').lower() == 'true'
        return context

# Placeholder: Ready for views to be added