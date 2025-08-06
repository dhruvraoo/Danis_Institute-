from django.urls import path
from . import views

urlpatterns = [
    # Admin attendance management endpoints
    path('admin/', views.AttendanceAdminView.as_view(), name='attendance-admin'),
    
    # Student attendance history endpoint
    path('student/<int:student_id>/', views.StudentAttendanceView.as_view(), name='student-attendance'),
]