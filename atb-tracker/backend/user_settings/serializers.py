from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'first_name', 'last_name', 'email', 'phone', 'job_title',
            'company', 'bio', 'location', 'website', 'timezone', 'avatar'
        ]
        read_only_fields = ['user', 'id']

    def get_avatar(self, obj):
        request = self.context.get('request')
        if obj.avatar:
            if request is not None:
                return request.build_absolute_uri(obj.avatar.url)
            else:
                return obj.avatar.url
        return None
