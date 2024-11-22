from django import forms
from .models import Booking
from users.models import User

class BookingAdminForm(forms.ModelForm):
    class Meta:
        model = Booking
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Filter the sitter queryset to only show users who are sitters
        self.fields['sitter'].queryset = User.objects.filter(is_sitter=True)
