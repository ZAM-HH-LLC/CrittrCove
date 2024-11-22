from django.contrib import admin
from .models import Sitter

@admin.register(Sitter)
class SitterAdmin(admin.ModelAdmin):
    list_display = ('get_full_name', 'get_email', 'average_rating', 'total_reviews', 'subscribed', 'created_at')
    list_filter = ('subscribed', 'average_rating')
    search_fields = ('user__email', 'user__full_name', 'bio')
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
        ('Profile Information', {
            'fields': ('bio', 'profile_picture')
        }),
        ('Location', {
            'fields': ('latitude', 'longitude')
        }),
        ('Ratings & Reviews', {
            'fields': ('average_rating', 'total_reviews')
        }),
        ('Services & Preferences', {
            'fields': ('services_offered', 'animal_types_accepted', 'availability')
        }),
        ('Status', {
            'fields': ('subscribed',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )