from django.contrib import admin
from .models import Booking
from .forms import BookingAdminForm

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    form = BookingAdminForm
    list_display = ('id', 'client', 'sitter', 'service_type', 'start_date', 'end_date', 'status')
    list_filter = ('status', 'service_type')
    search_fields = ('client__user__email', 'sitter__email')
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Filter the sitter queryset to only show users who are sitters
        form.base_fields['sitter'].queryset = form.base_fields['sitter'].queryset.filter(is_sitter=True)
        return form
