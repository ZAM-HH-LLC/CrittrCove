from django.contrib import admin
from .models import BookingOccurrenceRate

@admin.register(BookingOccurrenceRate)
class BookingOccurrenceRateAdmin(admin.ModelAdmin):
    list_display = ('occurrence_rate_id', 'occurrence', 'rate_title', 'rate_amount', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('rate_title', 'rate_description', 'occurrence__booking__client__user__email')
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Basic Information', {
            'fields': ('occurrence', 'rate_title', 'rate_amount', 'rate_description')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
