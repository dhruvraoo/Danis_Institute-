from django.contrib import admin
from django.contrib.auth.hashers import make_password
from .models import Student, Faculty, Principal, Subject, Class, AdminUser

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code')
    ordering = ('name',)

@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ('name', 'grade_level', 'section')
    list_filter = ('grade_level', 'section')
    search_fields = ('name',)
    ordering = ('grade_level', 'section')

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'roll_id', 'student_class')
    list_filter = ('student_class', 'subjects_selected')
    search_fields = ('name', 'email', 'roll_id')
    filter_horizontal = ('subjects_selected',)
    ordering = ('name',)

@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'get_subjects', 'get_classes')
    list_filter = ('subjects', 'classes')
    search_fields = ('name', 'email')
    filter_horizontal = ('subjects', 'classes')
    ordering = ('name',)
    
    def get_subjects(self, obj):
        return ", ".join([subject.name for subject in obj.subjects.all()])
    get_subjects.short_description = 'Subjects'
    
    def get_classes(self, obj):
        return ", ".join([cls.name for cls in obj.classes.all()])
    get_classes.short_description = 'Classes'

@admin.register(Principal)
class PrincipalAdmin(admin.ModelAdmin):
    list_display = ('name', 'email')
    search_fields = ('name', 'email')
    ordering = ('name',)


@admin.register(AdminUser)
class AdminUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('username',)
    ordering = ('username',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Admin Information', {
            'fields': ('username', 'password', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        # Hash password if it's being changed and not already hashed
        if 'password' in form.changed_data:
            if not obj.password.startswith(('pbkdf2_', 'bcrypt', 'argon2')):
                obj.set_password(obj.password)
        super().save_model(request, obj, form, change)
