from rest_framework import generics, permissions
from .models import UserProfile
from .serializers import UserProfileSerializer

class UserProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        user = self.request.user
        if user.is_authenticated:
            profile, created = UserProfile.objects.get_or_create(user=user, defaults={
                'email': user.email or '',
                'first_name': user.first_name or '',
                'last_name': user.last_name or '',
            })
            return profile
        else:
            # For anonymous users, use or create a singleton profile (id=1) or the first available profile
            profile, created = UserProfile.objects.get_or_create(pk=1, defaults={
                'email': '',
                'first_name': 'Anonymous',
                'last_name': 'User',
            })
            return profile
