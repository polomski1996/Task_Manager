from rest_framework import serializers
from .models import Task, Week_Target

#serialize for Task
class TaskSerializer(serializers.ModelSerializer):
    parent_task_name = serializers.CharField(source='parent_task.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'name', 'parent_task', 'parent_task_name', 
            'acceptance_criteria', 'start_hour', 'estimated_time', 
            'date', 'is_done'
        ]
        read_only_fields = ['id']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Format time for display
        if instance.start_hour:
            representation['start_hour'] = instance.start_hour.strftime('%I:%M %p')
        # Format date for display
        # representation['date'] = instance.date.strftime('%d.%m.%Y')
        return representation
    
#serializer for Week_Target
class Week_TargetSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many = True, read_only = True)
    percent = serializers.ReadOnlyField() #coumputed field

    class Meta:
        model = Week_Target
        fields = ['id', 'name', 'description', 'tasks', 'percent', 'deadline', 'is_done']