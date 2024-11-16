from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

class UserAdmin(BaseUserAdmin):
    # The fields to be used in displaying the User model.
    # These override the definitions on the base UserAdmin
    # that reference specific fields on auth.User.
    list_display = (
        'email', 'full_name', 'is_staff', 'is_sitter', 'approved_dog_sitting', 'approved_cat_sitting', 'approved_exotics_sitting'
    )
    list_filter = (
        'is_staff', 'is_superuser', 'is_active', 'is_sitter', 'approved_dog_sitting', 'approved_cat_sitting', 'approved_exotics_sitting'
    )
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('full_name',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Sitter info', {'fields': ('is_sitter', 'approved_dog_sitting', 'approved_cat_sitting', 'approved_exotics_sitting', 'sitter_description')}),
        ('Important dates', {'fields': ('last_login', 'approved_at', 'created_at')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password1', 'password2'),
        }),
    )
    readonly_fields = ('last_login', 'approved_at', 'created_at')
    search_fields = ('email', 'full_name')
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)

# Now register the new UserAdmin...
admin.site.register(User, UserAdmin)
