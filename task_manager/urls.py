from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import TaskViewSet, WeekTargetViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'week-targets', WeekTargetViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # path('api/get_parent_tasks/', views.TaskViewSet.get_parent_tasks, name='get_parent_tasks'),
]