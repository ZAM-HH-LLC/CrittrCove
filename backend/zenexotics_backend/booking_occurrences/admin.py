from django.contrib import admin
from .models import BookingOccurrence

@admin.register(BookingOccurrence)
class BookingOccurrenceAdmin(admin.ModelAdmin):
    list_display = ('occurrence_id', 'booking', 'start_date', 'end_date', 'start_time', 'end_time', 'status', 'calculated_cost')
    list_filter = ('status', 'start_date', 'created_by')
    search_fields = ('booking__client__user__email', 'booking__professional__user__email')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Information', {
            'fields': ('booking', 'status')
        }),
        ('Time Details', {
            'fields': ('start_date', 'end_date', 'start_time', 'end_time')
        }),
        ('Financial', {
            'fields': ('calculated_cost',)
        }),
        ('Tracking', {
            'fields': ('created_by', 'last_modified_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
