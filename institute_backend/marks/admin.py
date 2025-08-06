from django.contrib import admin
from .models import Exam, Marks


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ['name', 'exam_date', 'student_class', 'created_at']
    list_filter = ['exam_date', 'student_class__grade_level', 'student_class']
    search_fields = ['name', 'student_class__name']
    ordering = ['-exam_date', 'name']
    date_hierarchy = 'exam_date'
    
    fieldsets = (
        ('Exam Information', {
            'fields': ('name', 'exam_date', 'student_class')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Marks)
class MarksAdmin(admin.ModelAdmin):
    list_display = ['student', 'exam', 'subject', 'marks_obtained', 'total_marks', 'percentage', 'grade']
    list_filter = [
        'exam__exam_date', 
        'exam__student_class__grade_level',
        'exam__student_class',
        'subject',
        'exam'
    ]
    search_fields = [
        'student__name', 
        'student__roll_id',
        'exam__name', 
        'subject__name',
        'subject__code'
    ]
    ordering = ['-exam__exam_date', 'student__name', 'subject__name']
    date_hierarchy = 'exam__exam_date'
    
    fieldsets = (
        ('Student & Exam Information', {
            'fields': ('student', 'exam', 'subject')
        }),
        ('Marks Details', {
            'fields': ('marks_obtained', 'total_marks')
        }),
        ('Calculated Fields', {
            'fields': ('percentage', 'grade'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['percentage', 'grade', 'created_at', 'updated_at']
    
    def get_queryset(self, request):
        """Optimize queries with select_related"""
        return super().get_queryset(request).select_related(
            'student', 'exam', 'subject', 'exam__student_class'
        )
    
    def percentage(self, obj):
        """Display percentage in admin"""
        return f"{obj.percentage}%"
    percentage.short_description = 'Percentage'
    
    def grade(self, obj):
        """Display grade in admin"""
        return obj.grade
    grade.short_description = 'Grade'


# Customize admin site header and title
admin.site.site_header = "Institute Management System"
admin.site.site_title = "Institute Admin"
admin.site.index_title = "Welcome to Institute Administration"