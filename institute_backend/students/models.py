from django.db import models
from django.utils import timezone
from accounts.models import Student, Subject
import json

# Create your models here.

class AdmissionInquiry(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('contacted', 'Contacted'),
        ('resolved', 'Resolved'),
    ]
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    course = models.CharField(max_length=50)
    previous_education = models.CharField(max_length=100, blank=True)
    subjects = models.TextField()  # Store as JSON string
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Admission Inquiry'
        verbose_name_plural = 'Admission Inquiries'
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['email']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.course}"
    
    def get_subjects_list(self):
        """Convert subjects JSON string to Python list"""
        try:
            return json.loads(self.subjects)
        except (json.JSONDecodeError, TypeError):
            return []
    
    def set_subjects_list(self, subjects_list):
        """Convert Python list to JSON string for storage"""
        self.subjects = json.dumps(subjects_list)
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class StudentMark(models.Model):
    EXAM_TYPE_CHOICES = [
        ('quiz', 'Quiz'),
        ('midterm', 'Midterm'),
        ('final', 'Final Exam'),
        ('assignment', 'Assignment'),
        ('project', 'Project'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='marks')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    exam_type = models.CharField(max_length=20, choices=EXAM_TYPE_CHOICES)
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    total_marks = models.DecimalField(max_digits=5, decimal_places=2)
    exam_date = models.DateField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-exam_date', 'subject__name']
        verbose_name = 'Student Mark'
        verbose_name_plural = 'Student Marks'
        indexes = [
            models.Index(fields=['student', 'subject']),
            models.Index(fields=['exam_date']),
            models.Index(fields=['exam_type']),
        ]
        unique_together = ['student', 'subject', 'exam_type', 'exam_date']
    
    def __str__(self):
        return f"{self.student.name} - {self.subject.name} ({self.exam_type}): {self.marks_obtained}/{self.total_marks}"
    
    @property
    def percentage(self):
        """Calculate percentage score"""
        if self.total_marks > 0:
            return round((self.marks_obtained / self.total_marks) * 100, 2)
        return 0
    
    @property
    def grade(self):
        """Calculate letter grade based on percentage"""
        percentage = self.percentage
        if percentage >= 90:
            return 'A+'
        elif percentage >= 80:
            return 'A'
        elif percentage >= 70:
            return 'B+'
        elif percentage >= 60:
            return 'B'
        elif percentage >= 50:
            return 'C'
        elif percentage >= 40:
            return 'D'
        else:
            return 'F'
