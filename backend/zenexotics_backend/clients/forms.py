from django import forms
from .models import Client

PET_TYPE_CHOICES = [
    ('Dog', 'Dog'),
    ('Cat', 'Cat'),
    ('Exotic', 'Exotic'),
]

class ClientAdminForm(forms.ModelForm):
    pet_types = forms.MultipleChoiceField(
        choices=PET_TYPE_CHOICES,
        widget=forms.CheckboxSelectMultiple,
        required=False
    )

    class Meta:
        model = Client
        fields = '__all__'
