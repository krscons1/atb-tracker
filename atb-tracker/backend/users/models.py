from django.db import models
from django.contrib.auth.hashers import make_password, check_password

class Member(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128, null=True, blank=True)  # Hashed password
    firebase_uid = models.CharField(max_length=128, unique=True, null=True, blank=True)
    picture = models.URLField(max_length=500, null=True, blank=True)
    provider = models.CharField(max_length=50, default='email')  # 'email' or 'google'
    email_verified = models.BooleanField(default=False)
    rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    work_hours = models.CharField(max_length=255, blank=True, null=True)
    access_rights = models.CharField(max_length=100, blank=True, null=True)
    groups = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'users_member'
