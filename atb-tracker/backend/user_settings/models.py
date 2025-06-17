from django.db import models
from django.conf import settings

class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    job_title = models.CharField(max_length=100, blank=True)
    company = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=150, blank=True)
    website = models.URLField(max_length=255, blank=True)
    timezone = models.CharField(max_length=100, blank=True)
    avatar = models.URLField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.user.username} Profile"
