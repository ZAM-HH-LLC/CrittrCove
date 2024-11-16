from django.urls import path
from .views import ContractTemplateListView, ContractListCreateView, ContractDetailView

urlpatterns = [
    path('templates/', ContractTemplateListView.as_view(), name='contract_templates'),
    path('', ContractListCreateView.as_view(), name='contract_list_create'),
    path('<int:pk>/', ContractDetailView.as_view(), name='contract_detail'),
]