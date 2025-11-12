from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, WeekTargetViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'week-targets', WeekTargetViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]