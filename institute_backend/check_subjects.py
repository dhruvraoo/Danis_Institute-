#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'institute_backend.settings')
django.setup()

from accounts.models import Student, Subject

print("=== SUBJECTS IN DATABASE ===")
subjects = Subject.objects.all()
for s in subjects:
    print(f"- {s.name} ({s.code}) - Grade levels: {s.grade_levels}")

print(f"\nTotal subjects: {subjects.count()}")

print("\n=== STUDENTS AND THEIR SELECTED SUBJECTS ===")
students = Student.objects.all()
for student in students:
    selected_subjects = student.subjects_selected.all()
    subject_names = [s.name for s in selected_subjects]
    print(f"- {student.name} (Class: {student.student_class.name}): {subject_names}")

print(f"\nTotal students: {students.count()}")

# Check if any student has selected subjects
students_with_subjects = Student.objects.filter(subjects_selected__isnull=False).distinct()
print(f"\nStudents with selected subjects: {students_with_subjects.count()}")