from django.contrib import admin
from .models import Client

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('get_name', 'get_email', 'last_booking', 'created_at')
    list_filter = ('last_booking', 'created_at')
    search_fields = ('user__email', 'user__name')
    readonly_fields = ('created_at', 'updated_at')

    def get_name(self, obj):
        return obj.user.name
    get_name.short_description = 'Name'

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'

    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Client Details', {
            'fields': ('about_me', 'emergency_contact_name', 
                      'emergency_contact_phone', 'authorized_household_members')
        }),
        ('Booking Information', {
            'fields': ('last_booking',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
