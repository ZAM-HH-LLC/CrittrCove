from django.contrib import admin
from .models import BookingSummary

@admin.register(BookingSummary)
class BookingSummaryAdmin(admin.ModelAdmin):
    list_display = ('summary_id', 'booking', 'subtotal', 'client_fee', 'taxes', 'total_client_cost', 'total_sitter_payout')
    search_fields = ('booking__client__user__email', 'booking__professional__user__email')
    fieldsets = (
        ('Basic Information', {
            'fields': ('booking',)
        }),
        ('Financial Details', {
            'fields': ('subtotal', 'client_fee', 'taxes', 'total_client_cost', 'total_sitter_payout')
        }),
        ('Rates', {
            'fields': ('fee_percentage', 'tax_percentage')
        }),
    )
