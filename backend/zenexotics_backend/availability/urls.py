from django.urls import path, include

app_name = 'availability'

urlpatterns = [
    path('v1/', include('availability.api.v1.urls')),
]