from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.contrib.auth import get_user_model
from users.models import Member
from .models import UserProfile
from .serializers import UserProfileSerializer
from auth_app.models import AuthToken
from django.utils import timezone
from rest_framework.exceptions import NotAuthenticated

class TokenAuthenticationPermission(BasePermission):
    """
    Custom permission class that checks for valid token authentication
    """
    def has_permission(self, request, view):
        print(f"DEBUG: Checking permission for {request.method} {request.path}")
        print(f"DEBUG: Authorization header: {request.headers.get('Authorization')}")
        user = get_user_from_token(request)
        print(f"DEBUG: User found: {user}")
        return user is not None

def get_user_from_token(request):
    """Extract user from authentication token"""
    auth_header = request.headers.get('Authorization')
    print(f"DEBUG: Auth header: {auth_header}")
    if not auth_header or not auth_header.startswith('Bearer '):
        print("DEBUG: No valid Authorization header")
        return None
    
    token = auth_header.split(' ')[1]
    print(f"DEBUG: Token extracted: {token[:10]}...")
    try:
        auth_token = AuthToken.objects.get(
            token=token,
            is_active=True,
            expires_at__gt=timezone.now()
        )
        print(f"DEBUG: AuthToken found for user: {auth_token.user.id}")
        return auth_token.user
    except AuthToken.DoesNotExist:
        print("DEBUG: AuthToken not found or invalid")
        return None

class UserProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [TokenAuthenticationPermission]

    def get_object(self):
        user = get_user_from_token(self.request)
        if user:
            profile, created = UserProfile.objects.get_or_create(user=user, defaults={
                'email': user.email or '',
                'first_name': user.name.split()[0] if user.name else '',
                'last_name': ' '.join(user.name.split()[1:]) if user.name and len(user.name.split()) > 1 else '',
                'avatar': user.picture or '',
            })
            return profile
        else:
            raise NotAuthenticated("Authentication credentials were not provided or are invalid.")

@api_view(['DELETE'])
@permission_classes([TokenAuthenticationPermission])
def delete_account(request):
    """Delete user account and all associated data"""
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        # Delete user profile
        try:
            profile = UserProfile.objects.get(user=user)
            profile.delete()
        except UserProfile.DoesNotExist:
            pass
        
        # Delete user
        user.delete()
        
        return Response({'message': 'Account deleted successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': f'Failed to delete account: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
