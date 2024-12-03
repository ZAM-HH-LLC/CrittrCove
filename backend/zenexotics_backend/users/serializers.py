from rest_framework import serializers
from django.contrib.auth.models import BaseUserManager
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'password',
            'user_id', 'date_joined', 'approved_at', 'is_sitter',
            'approved_for_dogs', 'approved_for_cats', 'approved_for_exotics'
        ]
        read_only_fields = [
            'user_id', 'date_joined', 'approved_at', 'is_sitter',
            'approved_for_dogs', 'approved_for_cats', 'approved_for_exotics'
        ]

    def create(self, validated_data):
        name = f"{validated_data['first_name']} {validated_data['last_name']}"
        user = User.objects.create_user(
            email=validated_data['email'],
            name=name,
            password=validated_data['password']
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'email', 'name', 'is_sitter', 'is_client',
            'approved_for_dogs', 'approved_for_cats', 'approved_for_exotics'
        ]
