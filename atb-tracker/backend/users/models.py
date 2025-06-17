from django.db import models

class Member(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    work_hours = models.CharField(max_length=255, blank=True, null=True)
    access_rights = models.CharField(max_length=100, blank=True, null=True)
    groups = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
