from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'email', 
        'name', 
        'is_active',
        'is_staff',
        'is_verified',
        'is_sitter',
        'approved_for_dogs', 
        'approved_for_cats', 
        'approved_for_exotics'
    )
    
    list_filter = (
        'is_active',
        'is_staff',
        'is_verified',
        'is_client',
        'is_sitter',
        'approved_for_dogs', 
        'approved_for_cats', 
        'approved_for_exotics'
    )
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('email', 'name', 'password', 'profile_picture', 'phone_number', 'address')
        }),
        ('Permissions', {
            'fields': (
                'is_active', 'is_staff', 'is_superuser', 'is_verified',
                'is_client', 'is_sitter', 'groups', 'user_permissions'
            )
        }),
        ('Sitter Status', {
            'fields': (
                'approved_for_dogs', 'approved_for_cats', 'approved_for_exotics',
                'approved_at', 'wants_to_be_sitter', 'wants_dog_approval',
                'wants_cat_approval', 'wants_exotics_approval'
            )
        }),
        ('Important dates', {
            'fields': ('date_joined', 'last_login')
        }),
    )
    
    readonly_fields = ('date_joined', 'last_login', 'user_id')
    search_fields = ('email', 'name', 'phone_number')
    ordering = ('email',)
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password1', 'password2'),
        }),
    )
