from rest_framework import generics
from .models import PomodoroSession
from .serializers import PomodoroSessionSerializer

class PomodoroSessionListCreateView(generics.ListCreateAPIView):
    queryset = PomodoroSession.objects.all()
    serializer_class = PomodoroSessionSerializer

class PomodoroSessionRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PomodoroSession.objects.all()
    serializer_class = PomodoroSessionSerializer 