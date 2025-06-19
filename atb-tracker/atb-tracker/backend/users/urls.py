from django.urls import path
from .views import MemberListCreateView

urlpatterns = [
    path('members/', MemberListCreateView.as_view(), name='member-list-create'),
]
