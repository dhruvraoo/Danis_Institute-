from django.urls import path
from . import views

urlpatterns = [
    path('admission-inquiry/', views.create_admission_inquiry, name='create_admission_inquiry'),
    path('admin/inquiries/', views.get_admission_inquiries, name='get_admission_inquiries'),
    path('admin/inquiries/<int:inquiry_id>/status/', views.update_inquiry_status, name='update_inquiry_status'),
]