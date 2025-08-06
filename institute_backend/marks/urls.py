from django.urls import path
from .views import ExamManagementView, MarksManagementView, StudentMarksView

urlpatterns = [
    path('api/exams/', ExamManagementView.as_view(), name='exam-management'),
    path('api/exams/<int:exam_id>/marks/', MarksManagementView.as_view(), name='marks-management'),
    path('api/my-marks/', StudentMarksView.as_view(), name='student-marks'),
]