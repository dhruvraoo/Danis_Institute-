from django.urls import path
from . import views

urlpatterns = [
    # Traditional Django URLs (for templates)
    path('student/signup/', views.student_signup, name='student_signup'),
    path('student/login/', views.student_login, name='student_login'),
    path('faculty/login/', views.faculty_login, name='faculty_login'),
    path('principal/login/', views.principal_login, name='principal_login'),
    
    # API URLs (for React frontend)
    path('api/student/signup/', views.api_student_signup, name='api_student_signup'),
    path('api/student/login/', views.api_student_login, name='api_student_login'),
    path('api/faculty/login/', views.api_faculty_login, name='api_faculty_login'),
    path('api/principal/login/', views.api_principal_login, name='api_principal_login'),
    path('api/logout/', views.api_logout, name='api_logout'),
    path('api/classes/', views.api_get_classes, name='api_get_classes'),
    path('api/subjects/', views.api_get_subjects, name='api_get_subjects'),
    path('api/student/current/', views.api_get_current_student, name='api_get_current_student'),
    path('api/student/practice-questions/', views.api_get_student_practice_questions, name='api_get_student_practice_questions'),
    path('api/student/marks/', views.api_get_student_marks, name='api_get_student_marks'),
    path('api/student/book-recommendations/', views.api_get_book_recommendations, name='api_get_book_recommendations'),
    path('api/student/update-subjects/', views.api_update_student_subjects, name='api_update_student_subjects'),
    path('api/student/available-subjects/', views.api_get_available_subjects, name='api_get_available_subjects'),
    path('api/debug-session/', views.api_debug_session, name='api_debug_session'),
    path('api/check-auth/', views.api_check_auth, name='api_check_auth'),
    
    # Fake News Detection APIs
    path('api/fake-news/detect/', views.api_detect_fake_news, name='api_detect_fake_news'),
    path('api/fake-news/status/', views.api_fake_news_status, name='api_fake_news_status'),
    
    # Admin Authentication
    path('api/admin-login/', views.api_admin_login, name='api_admin_login'),
    
    # Admin User Registration
    path('api/admin/register-faculty/', views.api_admin_register_faculty, name='api_admin_register_faculty'),
    path('api/admin/register-principal/', views.api_admin_register_principal, name='api_admin_register_principal'),
    path('api/admin/classes/', views.api_admin_get_classes, name='api_admin_get_classes'),
    path('api/admin/subjects/', views.api_admin_get_subjects, name='api_admin_get_subjects'),
]
