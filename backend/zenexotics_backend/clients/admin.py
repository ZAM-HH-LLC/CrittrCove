from django.contrib import admin
from .models import Client
from .forms import ClientAdminForm

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    form = ClientAdminForm
    list_display = ('name', 'email', 'last_booking', 'sitter')
    search_fields = ('name', 'email')

    def save_model(self, request, obj, form, change):
        # Convert the list of pet types to JSON format before saving
        obj.pet_types = form.cleaned_data['pet_types']
        super().save_model(request, obj, form, change)
