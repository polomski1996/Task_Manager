from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def get_queryset(self):
        queryset = Task.objects.all()
        
        # Filter by date if provided
        date = self.request.query_params.get('date', None)
        if date:
            queryset = queryset.filter(date=date)
            
        return queryset

    @action(detail=True, methods=['post'])
    def toggle_done(self, request, pk=None):
        task = self.get_object()
        task.is_done = not task.is_done
        task.save()
        return Response({'status': 'done toggled', 'is_done': task.is_done})