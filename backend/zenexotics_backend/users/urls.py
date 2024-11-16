from django.urls import path
from .views import RegisterView, PasswordResetRequestView, PasswordResetConfirmView, SitterStatusView, get_user_name, ContactFormView, ChangePasswordView, get_user_info

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('reset-password/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('reset-password-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('sitter-status/', SitterStatusView.as_view(), name='sitter_status'),
    path('get-name/', get_user_name, name='get_user_name'),
    path('contact/', ContactFormView.as_view(), name='contact_form'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('get-info/', get_user_info, name='get_user_info'),
]
