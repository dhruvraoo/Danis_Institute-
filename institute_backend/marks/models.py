from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from accounts.models import Student, Subject, Class


class MarksManager(models.Manager):
    """Custom manager for Marks model with optimized queries"""
    
    def get_student_marks_optimized(self, student):
        """Get all marks for a student with optimized queries"""
        return self.filter(
            student=student
        ).select_related(
            'exam', 
            'subject', 
            'exam__student_class'
        ).order_by('-exam__exam_date', 'subject__name')
    
    def get_exam_marks_optimized(self, exam):
        """Get all marks for an exam with optimized queries"""
        return self.filter(
            exam=exam
        ).select_related(
            'student', 
            'subject', 
            'student__student_class'
        ).order_by('student__name', 'subject__name')
    
    def get_marks_by_class_and_subject(self, student_class, subject):
        """Get marks for a specific class and subject"""
        return self.filter(
            exam__student_class=student_class,
            subject=subject
        ).select_related(
            'student', 
            'exam'
        ).order_by('-exam__exam_date', 'student__name')


class Exam(models.Model):
    name = models.CharField(max_length=100)
    exam_date = models.DateField()
    student_class = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='exams')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-exam_date', 'name']
        verbose_name = 'Exam'
        verbose_name_plural = 'Exams'
        indexes = [
            models.Index(fields=['student_class', '-exam_date']),
            models.Index(fields=['exam_date']),
            models.Index(fields=['student_class', 'name']),
            models.Index(fields=['-exam_date', 'name']),
        ]
        unique_together = ['name', 'exam_date', 'student_class']
    
    def __str__(self):
        return f"{self.name} - {self.student_class.name} ({self.exam_date})"


class Marks(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='exam_marks')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='marks')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    marks_obtained = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    total_marks = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = MarksManager()
    
    class Meta:
        ordering = ['-exam__exam_date', 'subject__name']
        verbose_name = 'Mark'
        verbose_name_plural = 'Marks'
        indexes = [
            models.Index(fields=['student', 'exam']),
            models.Index(fields=['exam', 'subject']),
            models.Index(fields=['student', 'subject']),
            models.Index(fields=['exam', 'student']),
            models.Index(fields=['created_at']),
            models.Index(fields=['updated_at']),
        ]
        unique_together = ['student', 'exam', 'subject']
    
    def __str__(self):
        return f"{self.student.name} - {self.exam.name} - {self.subject.name}: {self.marks_obtained}/{self.total_marks}"
    
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
    
    def clean(self):
        """Custom validation to ensure marks_obtained <= total_marks"""
        from django.core.exceptions import ValidationError
        if self.marks_obtained > self.total_marks:
            raise ValidationError('Marks obtained cannot be greater than total marks.')