from django.urls import path
from .views import PomodoroSessionListCreateView, PomodoroSessionRetrieveUpdateDestroyView

urlpatterns = [
    path('pomodoros/', PomodoroSessionListCreateView.as_view(), name='pomodoro-list-create'),
    path('pomodoros/<int:pk>/', PomodoroSessionRetrieveUpdateDestroyView.as_view(), name='pomodoro-detail'),
] 