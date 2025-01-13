from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('booking_id', 'client', 'professional', 'service_type', 'status', 'subtotal', 'total_client_cost', 'created_at')
    list_filter = ('status', 'service_type', 'created_at')
    search_fields = ('client__user__email', 'professional__user__email', 'service_type')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Information', {
            'fields': ('client', 'professional', 'service_type', 'status')
        }),
        ('Financial Details', {
            'fields': ('subtotal', 'total_client_cost', 'total_sitter_payout')
        }),
        ('User Actions', {
            'fields': ('initiated_by', 'cancelled_by', 'last_modified_by', 'denied_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
