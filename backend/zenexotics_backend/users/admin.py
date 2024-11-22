from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

class UserAdmin(BaseUserAdmin):
    list_display = (
        'email', 'full_name', 'user_id', 'is_staff', 'is_client', 'is_sitter', 
        'approved_dog_sitting', 'approved_cat_sitting', 'approved_exotics_sitting'
    )
    
    list_filter = (
        'is_staff', 'is_superuser', 'is_active', 'is_client', 'is_sitter',
        'approved_dog_sitting', 'approved_cat_sitting', 'approved_exotics_sitting',
        'wants_to_be_sitter'
    )
    
    fieldsets = (
        (None, {
            'fields': ('email', 'password', 'user_id')
        }),
        ('Personal Information', {
            'fields': ('full_name', 'profile_picture', 'phone_number')
        }),
        ('Role Flags', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_client', 'is_sitter')
        }),
        ('Sitter Approvals', {
            'fields': (
                'approved_dog_sitting', 'approved_cat_sitting', 'approved_exotics_sitting',
                'approved_at'
            )
        }),
        ('Sitter Applications', {
            'fields': (
                'wants_to_be_sitter', 'wants_dog_sitting_approval',
                'wants_cat_sitting_approval', 'wants_exotics_sitting_approval'
            )
        }),
        ('Permissions', {
            'fields': ('groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Important Dates', {
            'fields': ('last_login', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password1', 'password2', 'is_client', 'is_sitter'),
        }),
    )
    
    readonly_fields = ('user_id', 'last_login', 'created_at', 'approved_at')
    search_fields = ('email', 'full_name', 'user_id', 'phone_number')
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)

admin.site.register(User, UserAdmin)
