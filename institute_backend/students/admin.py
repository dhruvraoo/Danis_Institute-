from django.contrib import admin
from .models import AdmissionInquiry, StudentMark

# Register your models here.


@admin.register(AdmissionInquiry)
class AdmissionInquiryAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'phone', 'course', 'status', 'created_at']
    list_filter = ['status', 'course', 'created_at']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone')
        }),
        ('Course Information', {
            'fields': ('course', 'previous_education', 'subjects')
        }),
        ('Inquiry Details', {
            'fields': ('message', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).order_by('-created_at')


@admin.register(StudentMark)
class StudentMarkAdmin(admin.ModelAdmin):
    list_display = ['student', 'subject', 'exam_type', 'marks_obtained', 'total_marks', 'percentage', 'grade', 'exam_date']
    list_filter = ['exam_type', 'subject', 'exam_date', 'student__student_class']
    search_fields = ['student__name', 'student__roll_id', 'subject__name', 'subject__code']
    readonly_fields = ['percentage', 'grade', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Student & Subject', {
            'fields': ('student', 'subject')
        }),
        ('Exam Details', {
            'fields': ('exam_type', 'exam_date')
        }),
        ('Marks', {
            'fields': ('marks_obtained', 'total_marks', 'percentage', 'grade')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student', 'subject')
