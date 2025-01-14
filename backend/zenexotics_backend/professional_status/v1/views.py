from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import ProfessionalStatus

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_professional_status(request):
    print(f"Received request from user ID: {request.user.id}")
    try:
        prof_status = ProfessionalStatus.objects.get(user=request.user)
        print(f"Found professional status for user {request.user.email}: {prof_status.is_approved}")
        response_data = {
            'is_approved': prof_status.is_approved,
            'approved_for_dogs': prof_status.approved_for_dogs,
            'approved_for_cats': prof_status.approved_for_cats,
            'approved_for_exotics': prof_status.approved_for_exotics,
        }
        print(f"Returning response data: {response_data}")
        return Response(response_data)
    except ProfessionalStatus.DoesNotExist:
        print(f"No professional status found for user {request.user.email}")
        response_data = {
            'is_approved': False,
            'approved_for_dogs': False,
            'approved_for_cats': False,
            'approved_for_exotics': False,
        }
        print(f"Returning default response data: {response_data}")
        return Response(response_data) 