#!/usr/bin/env python
"""
Demo script for Marks Management API

This script demonstrates how to use the Marks Management API endpoints.
Run this script from the Django shell: python manage.py shell < marks/demo.py
"""

from datetime import date, timedelta
from decimal import Decimal
from accounts.models import Student, Subject, Class
from marks.models import Exam, Marks

def create_demo_data():
    """Create demo data for testing the marks management system"""
    print("Creating demo data...")
    
    # Create a class
    test_class, created = Class.objects.get_or_create(
        name="Grade 10A",
        defaults={'grade_level': 10, 'section': 'A'}
    )
    print(f"Class: {test_class.name} ({'created' if created else 'exists'})")
    
    # Create subjects
    subjects_data = [
        {'name': 'Mathematics', 'code': 'MATH101', 'grade_levels': '9,10,11,12'},
        {'name': 'Physics', 'code': 'PHY101', 'grade_levels': '9,10,11,12'},
        {'name': 'Chemistry', 'code': 'CHEM101', 'grade_levels': '9,10,11,12'},
        {'name': 'English', 'code': 'ENG101', 'grade_levels': '9,10,11,12'},
    ]
    
    subjects = []
    for subject_data in subjects_data:
        subject, created = Subject.objects.get_or_create(
            code=subject_data['code'],
            defaults=subject_data
        )
        subjects.append(subject)
        print(f"Subject: {subject.name} ({'created' if created else 'exists'})")
    
    # Create students
    students_data = [
        {'name': 'John Doe', 'email': 'john@example.com', 'roll_id': '2024001'},
        {'name': 'Jane Smith', 'email': 'jane@example.com', 'roll_id': '2024002'},
        {'name': 'Bob Johnson', 'email': 'bob@example.com', 'roll_id': '2024003'},
    ]
    
    students = []
    for student_data in students_data:
        student, created = Student.objects.get_or_create(
            email=student_data['email'],
            defaults={
                **student_data,
                'password': 'password123',
                'student_class': test_class
            }
        )
        students.append(student)
        print(f"Student: {student.name} ({'created' if created else 'exists'})")
    
    # Create exams
    exams_data = [
        {'name': 'Mid Term Exam', 'exam_date': date.today() + timedelta(days=7)},
        {'name': 'Final Exam', 'exam_date': date.today() + timedelta(days=30)},
    ]
    
    exams = []
    for exam_data in exams_data:
        exam, created = Exam.objects.get_or_create(
            name=exam_data['name'],
            student_class=test_class,
            defaults=exam_data
        )
        exams.append(exam)
        print(f"Exam: {exam.name} ({'created' if created else 'exists'})")
    
    # Create sample marks
    print("\nCreating sample marks...")
    marks_data = [
        # John Doe - Mid Term
        {'student': students[0], 'exam': exams[0], 'subject': subjects[0], 'marks_obtained': Decimal('85.5'), 'total_marks': Decimal('100')},
        {'student': students[0], 'exam': exams[0], 'subject': subjects[1], 'marks_obtained': Decimal('78.0'), 'total_marks': Decimal('100')},
        {'student': students[0], 'exam': exams[0], 'subject': subjects[2], 'marks_obtained': Decimal('92.5'), 'total_marks': Decimal('100')},
        
        # Jane Smith - Mid Term
        {'student': students[1], 'exam': exams[0], 'subject': subjects[0], 'marks_obtained': Decimal('91.0'), 'total_marks': Decimal('100')},
        {'student': students[1], 'exam': exams[0], 'subject': subjects[1], 'marks_obtained': Decimal('88.5'), 'total_marks': Decimal('100')},
        {'student': students[1], 'exam': exams[0], 'subject': subjects[2], 'marks_obtained': Decimal('95.0'), 'total_marks': Decimal('100')},
    ]
    
    for mark_data in marks_data:
        mark, created = Marks.objects.get_or_create(
            student=mark_data['student'],
            exam=mark_data['exam'],
            subject=mark_data['subject'],
            defaults={
                'marks_obtained': mark_data['marks_obtained'],
                'total_marks': mark_data['total_marks']
            }
        )
        if created:
            print(f"Mark: {mark.student.name} - {mark.subject.name}: {mark.marks_obtained}/{mark.total_marks} ({mark.percentage}% - {mark.grade})")
    
    print("\nDemo data creation completed!")
    return test_class, students, subjects, exams

def demonstrate_api_usage():
    """Demonstrate API usage with examples"""
    print("\n" + "="*50)
    print("MARKS MANAGEMENT API DEMONSTRATION")
    print("="*50)
    
    # Create demo data
    test_class, students, subjects, exams = create_demo_data()
    
    print(f"\n1. EXAM MANAGEMENT")
    print("-" * 30)
    print(f"Available exams for Grade {test_class.grade_level}:")
    for exam in exams:
        print(f"  - {exam.name} ({exam.exam_date})")
    
    print(f"\n2. MARKS OVERVIEW")
    print("-" * 30)
    for student in students:
        print(f"\nStudent: {student.name} ({student.roll_id})")
        student_marks = Marks.objects.get_student_marks_optimized(student)
        
        if student_marks.exists():
            for mark in student_marks:
                print(f"  {mark.exam.name} - {mark.subject.name}: {mark.marks_obtained}/{mark.total_marks} ({mark.percentage}% - Grade: {mark.grade})")
        else:
            print("  No marks recorded yet")
    
    print(f"\n3. EXAM STATISTICS")
    print("-" * 30)
    for exam in exams:
        exam_marks = Marks.objects.get_exam_marks_optimized(exam)
        if exam_marks.exists():
            print(f"\n{exam.name}:")
            total_students = exam_marks.values('student').distinct().count()
            total_subjects = exam_marks.values('subject').distinct().count()
            avg_percentage = sum(mark.percentage for mark in exam_marks) / exam_marks.count()
            
            print(f"  Students: {total_students}")
            print(f"  Subjects: {total_subjects}")
            print(f"  Average Score: {avg_percentage:.2f}%")
            
            # Grade distribution
            grades = {}
            for mark in exam_marks:
                grade = mark.grade
                grades[grade] = grades.get(grade, 0) + 1
            
            print(f"  Grade Distribution: {dict(sorted(grades.items()))}")
    
    print(f"\n4. API ENDPOINTS SUMMARY")
    print("-" * 30)
    print("Available API endpoints:")
    print("  GET  /api/exams/?class_grade=10          - List exams for grade 10")
    print("  POST /api/exams/                         - Create new exam")
    print("  GET  /api/exams/1/marks/?student_id=1    - Get marks data for student in exam")
    print("  POST /api/exams/1/marks/                 - Bulk create/update marks")
    print("  GET  /api/my-marks/?student_id=1         - Get all marks for student")
    
    print(f"\n5. SAMPLE API REQUESTS")
    print("-" * 30)
    print("Create Exam (POST /api/exams/):")
    print("""{
    "name": "Unit Test 1",
    "exam_date": "2025-08-15",
    "student_class": 1
}""")
    
    print("\nBulk Create Marks (POST /api/exams/1/marks/):")
    print("""{
    "student_id": 1,
    "marks": [
        {"subject_id": 1, "marks_obtained": 85.5, "total_marks": 100},
        {"subject_id": 2, "marks_obtained": 78.0, "total_marks": 100}
    ]
}""")
    
    print("\n" + "="*50)
    print("DEMONSTRATION COMPLETED!")
    print("="*50)

if __name__ == "__main__":
    demonstrate_api_usage()