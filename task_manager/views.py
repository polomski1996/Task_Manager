from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from .models import Task, Week_Target
from .serializers import TaskSerializer, Week_TargetSerializer
from datetime import timedelta, date

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
    
    @action(detail=False, methods=['get'])
    def get_parent_tasks(self, request):
        """Dedicated endpoint for parent tasks"""
        parent_tasks = Task.objects.filter(parent_task__isnull=True)
        serializer = TaskSerializer(parent_tasks, many=True)
        return Response(serializer.data)
    
class WeekTargetViewSet(viewsets.ModelViewSet):
    queryset = Week_Target.objects.all()
    serializer_class = Week_TargetSerializer


    def get_queryset(self):
        queryset = Week_Target.objects.all()
        return queryset
    
    # get current week targets
    @action(detail=False, methods=['get'])
    def get_current_weektargets(self, request):
        """Dedicated endpoint for current Week targets"""
        from django.utils import timezone
        from datetime import timedelta
        
        today = timezone.now()
        week_ago = today - timedelta(days=7) 
        
        # filterring with django ORM
        current_week_targets = Week_Target.objects.filter(
            deadline__gte=today,
            deadline__lte = today + timedelta(days=7)
        )
        serializer = Week_TargetSerializer(current_week_targets, many=True)

        return Response(serializer.data)