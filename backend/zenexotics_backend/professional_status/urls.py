from django.urls import path, include

app_name = 'professional_status'

urlpatterns = [
    path('v1/', include(('professional_status.v1.urls', app_name), namespace='v1')),
]
