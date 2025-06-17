from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Project, Client, Task, TimeEntry
from .serializers import ProjectSerializer, ClientSerializer, TaskSerializer, TimeEntrySerializer

class ProjectListCreateView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class ClientListCreateView(generics.ListCreateAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

class ClientRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [permissions.AllowAny]

# Add this view for retrieve, update, and delete (needed for DELETE from frontend)
from rest_framework import permissions

# --- Task Views ---
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone

class TaskListCreateView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [AllowAny]

class TaskRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [AllowAny]

class CompletedTaskCountView(APIView):
    """
    Deprecated: Now returns the number of completed projects, not tasks, for consistency with the frontend.
    """
    permission_classes = [AllowAny]
    def get(self, request):
        start = request.GET.get('start')
        end = request.GET.get('end')
        qs = Project.objects.filter(status__iexact="Completed")
        if start:
            qs = qs.filter()  # Optionally filter by date if you have a date field
        if end:
            qs = qs.filter()  # Optionally filter by date if you have a date field
        return Response({"completed_tasks": qs.count()})

class CompletedProjectCountView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        start = request.GET.get('start')
        end = request.GET.get('end')
        qs = Project.objects.filter(status__iexact="Completed")
        if start:
            qs = qs.filter()  # Optionally filter by date if you have a date field
        if end:
            qs = qs.filter()  # Optionally filter by date if you have a date field
        return Response({"completed_projects": qs.count()})

# --- TimeEntry Views ---
class TimeEntryListCreateView(generics.ListCreateAPIView):
    serializer_class = TimeEntrySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = TimeEntry.objects.all()
        entry_type = self.request.query_params.get('type')
        if entry_type:
            queryset = queryset.filter(type=entry_type)
        return queryset

class TimeEntryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TimeEntry.objects.all()
    serializer_class = TimeEntrySerializer
    permission_classes = [AllowAny]

class ProjectRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.AllowAny]  # Adjust as needed

# Make sure your urls.py is configured to route DELETE requests to the correct view.
# Example for urls.py in your projects app:

# from django.urls import path
# from .views import ProjectListCreateView, ProjectRetrieveUpdateDestroyView

# urlpatterns = [
#     path('projects/', ProjectListCreateView.as_view(), name='project-list-create'),
#     path('projects/<int:pk>/', ProjectRetrieveUpdateDestroyView.as_view(), name='project-detail'),
# ]

# If your delete endpoint is still not working, check these common issues:

# 1. Make sure your urls.py is present and correct in your projects app:
# File: c:\Users\LENOVO\Desktop\Thamill\atb-tracker-landing\atb-tracker\backend\projects\urls.py

# from django.urls import path
# from .views import ProjectListCreateView, ProjectRetrieveUpdateDestroyView
# urlpatterns = [
#     path('projects/', ProjectListCreateView.as_view(), name='project-list-create'),
#     path('projects/<int:pk>/', ProjectRetrieveUpdateDestroyView.as_view(), name='project-detail'),
# ]

# 2. Make sure your main urls.py includes the projects urls:
# File: c:\Users\LENOVO\Desktop\Thamill\atb-tracker-landing\atb-tracker\backend\atb_tracker\urls.py

# from django.urls import path, include
# urlpatterns = [
#     path('api/', include('projects.urls')),
#     # ...other includes...
# ]

# 3. Make sure CORS is enabled for DELETE requests:
# In your settings.py, add/adjust:
# INSTALLED_APPS = [
#     ...existing code...
#     'corsheaders',
#     ...existing code...
# ]
# MIDDLEWARE = [
#     'corsheaders.middleware.CorsMiddleware',
#     ...existing code...
# ]
# CORS_ALLOW_ALL_ORIGINS = True  # For development only

# 4. Restart your backend server after any changes to urls.py or settings.py.

# 5. In your frontend, make sure the DELETE request is sent to the correct endpoint:
#    http://localhost:8000/api/projects/<id>/
#    (with trailing slash)

# 6. Check the Django runserver console for errors when you click delete.
#    If you see a 404, your URL is wrong.
#    If you see a 403, it's a permissions/CORS issue.

# 7. If you use a custom primary key (not 'id'), make sure <int:pk> matches your model's PK.

# 8. If you use DRF's DefaultRouter or ViewSets, the URL pattern may be different.
