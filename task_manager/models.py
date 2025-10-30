from django.db import models

# Create your models here.
from django.db import models
from django.utils import timezone

class Task(models.Model):
    name = models.CharField(max_length=200)
    parent_task = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subtasks')
    acceptance_criteria = models.TextField(blank=True)
    start_hour = models.TimeField(null=True, blank=True)
    estimated_time = models.CharField(max_length=50, blank=True)  # e.g., "1 hour", "30 minutes"
    date = models.TextField(blank=True)
    is_done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['date', 'start_hour']