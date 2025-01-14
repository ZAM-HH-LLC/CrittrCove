from django.urls import path, include

urlpatterns = [
    path('v1/', include('professional_status.v1.urls')),
] 