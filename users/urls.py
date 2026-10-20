from django.urls import path

from .views import (
    RegisterView,
    ProfileView,
    StudentDashboardView,
    TeacherDashboardView,
    VerifyTeacherView,
    TeacherListView,
    StudentListView,
)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('student-dashboard/', StudentDashboardView.as_view()),
    path('teacher-dashboard/', TeacherDashboardView.as_view()),
    path('verify-teacher/<int:pk>/', VerifyTeacherView.as_view()),
    path('teachers/', TeacherListView.as_view(), name='teacher-list'),
    path('students/', StudentListView.as_view(), name='student-list'),
]