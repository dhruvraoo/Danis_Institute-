from django.db import models
from django.utils import timezone
from accounts.models import Student


class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    present = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'date']
        ordering = ['-date', 'student__name']
        verbose_name = 'Attendance'
        verbose_name_plural = 'Attendance Records'
        indexes = [
            models.Index(fields=['student', 'date']),
            models.Index(fields=['date']),
            models.Index(fields=['present']),
        ]
    
    def __str__(self):
        status = "Present" if self.present else "Absent"
        return f"{self.student.name} - {self.date} ({status})"
