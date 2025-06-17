from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'first_name', 'last_name', 'email', 'phone', 'job_title',
            'company', 'bio', 'location', 'website', 'timezone', 'avatar'
        ]
        read_only_fields = ['user', 'id']
