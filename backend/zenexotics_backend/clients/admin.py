from django.contrib import admin
from .models import Client

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('get_full_name', 'get_email', 'last_booking', 'created_at')
    list_filter = ('last_booking', 'created_at')
    search_fields = ('user__email', 'user__full_name', 'address')
    readonly_fields = ('created_at', 'updated_at')

    def get_full_name(self, obj):
        return obj.user.full_name
    get_full_name.short_description = 'Name'

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'

    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Client Details', {
            'fields': ('address', 'about_me', 'emergency_contact_name', 
                      'emergency_contact_phone', 'authorized_household_members', 'pet_types')
        }),
        ('Booking Information', {
            'fields': ('last_booking',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
