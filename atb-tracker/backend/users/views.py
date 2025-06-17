from django.shortcuts import render

from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .models import Member
from .serializers import MemberSerializer

class MemberListCreateView(generics.ListCreateAPIView):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data = {
            'notification': 'Member added successfully!',
            'member': response.data
        }
        return response
