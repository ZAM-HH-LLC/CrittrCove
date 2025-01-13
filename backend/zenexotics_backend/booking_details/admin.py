from django.contrib import admin
from .models import BookingDetails

@admin.register(BookingDetails)
class BookingDetailsAdmin(admin.ModelAdmin):
    list_display = ('detail_id', 'booking', 'pet_type', 'num_pets', 'base_rate', 'additional_pet_rate', 'calculated_rate')
    list_filter = ('pet_type',)
    search_fields = ('booking__client__user__email', 'booking__professional__user__email')
    fieldsets = (
        ('Basic Information', {
            'fields': ('booking', 'pet_type', 'num_pets')
        }),
        ('Rates', {
            'fields': ('base_rate', 'additional_pet_rate', 'calculated_rate')
        }),
    )
