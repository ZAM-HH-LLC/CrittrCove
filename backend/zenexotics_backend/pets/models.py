from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Pet(models.Model):
    SPECIES_CHOICES = [
        ('DOG', 'Dog'),
        ('CAT', 'Cat'),
        ('BIRD', 'Bird'),
        ('FISH', 'Fish'),
        ('REPTILE', 'Reptile'),
        ('OTHER', 'Other'),
    ]
    
    SEX_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]
    
    ENERGY_LEVEL_CHOICES = [
        ('LOW', 'Low'),
        ('MODERATE', 'Moderate'),
        ('HIGH', 'High'),
    ]

    # Basic Information
    pet_id = models.AutoField(primary_key=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_pets',
        null=True,
        blank=True
    )
    name = models.CharField(max_length=100)
    species = models.CharField(max_length=20, choices=SPECIES_CHOICES)
    breed = models.CharField(max_length=100, blank=True)
    pet_type = models.CharField(max_length=100, blank=True, help_text="Specific type for exotic pets")
    
    # Age and Physical Details
    age_years = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True
    )
    age_months = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(11)],
        default=0,
        null=True,
        blank=True
    )
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    birthday = models.DateField(null=True, blank=True)
    sex = models.CharField(max_length=1, choices=SEX_CHOICES, null=True, blank=True)
    
    # Photos
    profile_photo = models.ImageField(upload_to='pet_photos/', null=True, blank=True)
    photo_gallery = models.JSONField(default=list, blank=True)
    
    # Dates
    adoption_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Description
    pet_description = models.TextField(blank=True)
    
    # Dog and Cat Specific
    friendly_with_children = models.BooleanField(null=True, blank=True)
    friendly_with_cats = models.BooleanField(null=True, blank=True)
    friendly_with_dogs = models.BooleanField(null=True, blank=True)
    spayed_neutered = models.BooleanField(null=True, blank=True)
    house_trained = models.BooleanField(null=True, blank=True)
    microchipped = models.BooleanField(null=True, blank=True)
    
    # Care Information
    feeding_schedule = models.TextField(blank=True)
    potty_break_schedule = models.TextField(blank=True)
    energy_level = models.CharField(max_length=20, choices=ENERGY_LEVEL_CHOICES, blank=True)
    can_be_left_alone = models.BooleanField(null=True, blank=True)
    medications = models.JSONField(default=dict, blank=True)
    medication_notes = models.TextField(blank=True)
    special_care_instructions = models.TextField(blank=True)
    
    # Veterinary Information
    vet_name = models.CharField(max_length=100, blank=True)
    vet_address = models.TextField(blank=True)
    vet_phone = models.CharField(max_length=20, blank=True)
    insurance_provider = models.CharField(max_length=100, blank=True)
    vet_documents = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.name} - {self.species} ({self.owner.email}'s pet)"

    class Meta:
        ordering = ['name']