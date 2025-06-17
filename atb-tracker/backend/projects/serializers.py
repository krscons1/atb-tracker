from rest_framework import serializers
from .models import Project, Client, Task, TimeEntry

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'name']

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'status', 'project', 'assigned_to', 'created_at', 'updated_at']

class TimeEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeEntry
        fields = [
            'id', 'project', 'description', 'start_time', 'end_time', 'duration', 'date', 'billable', 'type', 'created_at', 'updated_at'
        ]

class ProjectSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), source='client', write_only=True, required=False)

    class Meta:
        model = Project
        fields = ['id', 'name', 'client', 'client_id', 'status', 'progress']  # Expose new fields
