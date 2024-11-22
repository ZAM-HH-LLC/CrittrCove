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
            'user_id', 'created_at', 'approved_at', 'is_sitter',
            'approved_dog_sitting', 'approved_cat_sitting', 'approved_exotics_sitting'
        ]
        read_only_fields = [
            'user_id', 'created_at', 'approved_at', 'is_sitter',
            'approved_dog_sitting', 'approved_cat_sitting', 'approved_exotics_sitting'
        ]

    def create(self, validated_data):
        full_name = f"{validated_data['first_name']} {validated_data['last_name']}"
        user = User.objects.create_user(
            email=validated_data['email'],
            full_name=full_name,
            password=validated_data['password'],
            user_id='user_' + BaseUserManager().make_random_password(length=9)
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'email', 'full_name', 'is_sitter', 'is_client',
            'approved_dog_sitting', 'approved_cat_sitting', 'approved_exotics_sitting'
        ]
