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

        # Build query based on user's role(s)
        query = Q()
        if is_client:
            query |= Q(client=client)
        if is_professional:
            query |= Q(professional=professional)

        # Get bookings for the user
        bookings = Booking.objects.filter(query).select_related(
            'client__user',
            'professional__user'
        ).prefetch_related(
            'occurrences'
        ).order_by('-created_at')

        # Paginate results
        paginator = self.pagination_class()
        paginated_bookings = paginator.paginate_queryset(bookings, request)
        
        # Serialize the paginated data
        serializer = BookingListSerializer(paginated_bookings, many=True)
        
        # Return paginated response
        return Response({
            'bookings': serializer.data,
            'next_page': paginator.get_next_link()
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