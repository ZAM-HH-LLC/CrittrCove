from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import secrets
import string

# Create your models here.

class UserManager(BaseUserManager):
    def create_user(self, email, full_name, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, full_name=full_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, full_name, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    profile_picture = models.URLField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    
    # Role flags
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_client = models.BooleanField(default=True)
    is_sitter = models.BooleanField(default=False)
    
    # Sitter approval flags
    approved_dog_sitting = models.BooleanField(default=False)
    approved_cat_sitting = models.BooleanField(default=False)
    approved_exotics_sitting = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # Application flags
    wants_to_be_sitter = models.BooleanField(default=False)
    wants_dog_sitting_approval = models.BooleanField(default=False)
    wants_cat_sitting_approval = models.BooleanField(default=False)
    wants_exotics_sitting_approval = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    user_id = models.CharField(max_length=50, unique=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    objects = UserManager()

    def get_first_name(self):
        return self.full_name.split()[0]

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        if not self.user_id:
            self.user_id = 'user_' + ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(9))
        super().save(*args, **kwargs)

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True
