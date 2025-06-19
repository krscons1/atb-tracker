from django.db import models

# Create your models here.

class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    color = models.CharField(max_length=20, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Client(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class Project(models.Model):
    name = models.CharField(max_length=255)
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, blank=True, null=True, related_name='projects')
    status = models.CharField(max_length=50, default="Planning")
    progress = models.IntegerField(default=0)
    tags = models.ManyToManyField(Tag, blank=True, related_name='projects')

    def __str__(self):
        return self.name

class Task(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("In Progress", "In Progress"),
        ("Completed", "Completed"),
        ("On Hold", "On Hold"),
    ]
    title = models.CharField(max_length=255)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    assigned_to = models.CharField(max_length=255, blank=True, null=True)  # Could be ForeignKey to User if you have users
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.status})"

class TimeEntry(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="time_entries")
    description = models.TextField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration = models.IntegerField()  # in minutes
    date = models.DateField()
    billable = models.BooleanField(default=False)
    type = models.CharField(max_length=10, choices=[('regular', 'Regular'), ('pomodoro', 'Pomodoro')], default='regular')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.project.name} - {self.date} ({self.duration} min, {self.type})"
