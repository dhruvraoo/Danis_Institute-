from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from datetime import date, timedelta

from accounts.models import Student, Subject, Class
from .models import Exam, Marks
from .serializers import ExamSerializer, MarksSerializer, StudentMarksSerializer


class ExamModelTest(TestCase):
    """Test cases for Exam model"""
    
    def setUp(self):
        self.test_class = Class.objects.create(
            name="Grade 10A",
            grade_level=10,
            section="A"
        )
    
    def test_exam_creation(self):
        """Test exam creation with valid data"""
        exam = Exam.objects.create(
            name="Mid Term Exam",
            exam_date=date.today() + timedelta(days=7),
            student_class=self.test_class
        )
        
        self.assertEqual(exam.name, "Mid Term Exam")
        self.assertEqual(exam.student_class, self.test_class)
        self.assertTrue(exam.created_at)
        self.assertTrue(exam.updated_at)
    
    def test_exam_str_representation(self):
        """Test string representation of exam"""
        exam = Exam.objects.create(
            name="Final Exam",
            exam_date=date.today() + timedelta(days=30),
            student_class=self.test_class
        )
        
        expected_str = f"Final Exam - {self.test_class.name} ({exam.exam_date})"
        self.assertEqual(str(exam), expected_str)
    
    def test_exam_unique_constraint(self):
        """Test unique constraint on name, exam_date, student_class"""
        exam_date = date.today() + timedelta(days=7)
        
        # Create first exam
        Exam.objects.create(
            name="Test Exam",
            exam_date=exam_date,
            student_class=self.test_class
        )
        
        # Try to create duplicate exam
        with self.assertRaises(Exception):
            Exam.objects.create(
                name="Test Exam",
                exam_date=exam_date,
                student_class=self.test_class
            )


class MarksModelTest(TestCase):
    """Test cases for Marks model"""
    
    def setUp(self):
        self.test_class = Class.objects.create(
            name="Grade 10A",
            grade_level=10,
            section="A"
        )
        
        self.student = Student.objects.create(
            name="John Doe",
            email="john@example.com",
            password="password123",
            roll_id="2024001",
            student_class=self.test_class
        )
        
        self.subject = Subject.objects.create(
            name="Mathematics",
            code="MATH101",
            grade_levels="9,10,11,12"
        )
        
        self.exam = Exam.objects.create(
            name="Mid Term",
            exam_date=date.today() + timedelta(days=7),
            student_class=self.test_class
        )
    
    def test_marks_creation(self):
        """Test marks creation with valid data"""
        marks = Marks.objects.create(
            student=self.student,
            exam=self.exam,
            subject=self.subject,
            marks_obtained=Decimal('85.50'),
            total_marks=Decimal('100.00')
        )
        
        self.assertEqual(marks.student, self.student)
        self.assertEqual(marks.exam, self.exam)
        self.assertEqual(marks.subject, self.subject)
        self.assertEqual(marks.marks_obtained, Decimal('85.50'))
        self.assertEqual(marks.total_marks, Decimal('100.00'))
    
    def test_marks_percentage_calculation(self):
        """Test percentage calculation property"""
        marks = Marks.objects.create(
            student=self.student,
            exam=self.exam,
            subject=self.subject,
            marks_obtained=Decimal('85.50'),
            total_marks=Decimal('100.00')
        )
        
        self.assertEqual(marks.percentage, 85.5)
    
    def test_marks_grade_calculation(self):
        """Test grade calculation property"""
        test_cases = [
            (Decimal('95'), 'A+'),
            (Decimal('85'), 'A'),
            (Decimal('75'), 'B+'),
            (Decimal('65'), 'B'),
            (Decimal('55'), 'C'),
            (Decimal('45'), 'D'),
            (Decimal('35'), 'F'),
        ]
        
        for marks_obtained, expected_grade in test_cases:
            marks = Marks.objects.create(
                student=self.student,
                exam=self.exam,
                subject=self.subject,
                marks_obtained=marks_obtained,
                total_marks=Decimal('100.00')
            )
            
            self.assertEqual(marks.grade, expected_grade)
            marks.delete()  # Clean up for next iteration
    
    def test_marks_unique_constraint(self):
        """Test unique constraint on student, exam, subject"""
        # Create first marks record
        Marks.objects.create(
            student=self.student,
            exam=self.exam,
            subject=self.subject,
            marks_obtained=Decimal('85.50'),
            total_marks=Decimal('100.00')
        )
        
        # Try to create duplicate marks record
        with self.assertRaises(Exception):
            Marks.objects.create(
                student=self.student,
                exam=self.exam,
                subject=self.subject,
                marks_obtained=Decimal('90.00'),
                total_marks=Decimal('100.00')
            )


class ExamSerializerTest(TestCase):
    """Test cases for ExamSerializer"""
    
    def setUp(self):
        self.test_class = Class.objects.create(
            name="Grade 10A",
            grade_level=10,
            section="A"
        )
    
    def test_valid_exam_serialization(self):
        """Test serialization of valid exam data"""
        exam_data = {
            'name': 'Mid Term Exam',
            'exam_date': (date.today() + timedelta(days=7)).isoformat(),
            'student_class': self.test_class.id
        }
        
        serializer = ExamSerializer(data=exam_data)
        self.assertTrue(serializer.is_valid())
        
        exam = serializer.save()
        self.assertEqual(exam.name, 'Mid Term Exam')
        self.assertEqual(exam.student_class, self.test_class)
    
    def test_past_date_validation(self):
        """Test validation for past exam dates"""
        exam_data = {
            'name': 'Past Exam',
            'exam_date': (date.today() - timedelta(days=2)).isoformat(),  # Use 2 days ago
            'student_class': self.test_class.id
        }
        
        serializer = ExamSerializer(data=exam_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('exam_date', serializer.errors)


class MarksSerializerTest(TestCase):
    """Test cases for MarksSerializer"""
    
    def setUp(self):
        self.test_class = Class.objects.create(
            name="Grade 10A",
            grade_level=10,
            section="A"
        )
        
        self.student = Student.objects.create(
            name="John Doe",
            email="john@example.com",
            password="password123",
            roll_id="2024001",
            student_class=self.test_class
        )
        
        self.subject = Subject.objects.create(
            name="Mathematics",
            code="MATH101",
            grade_levels="9,10,11,12"
        )
        
        self.exam = Exam.objects.create(
            name="Mid Term",
            exam_date=date.today() + timedelta(days=7),
            student_class=self.test_class
        )
    
    def test_valid_marks_serialization(self):
        """Test serialization of valid marks data"""
        marks_data = {
            'student': self.student.id,
            'exam': self.exam.id,
            'subject': self.subject.id,
            'marks_obtained': '85.50',
            'total_marks': '100.00'
        }
        
        serializer = MarksSerializer(data=marks_data)
        self.assertTrue(serializer.is_valid())
        
        marks = serializer.save()
        self.assertEqual(marks.marks_obtained, Decimal('85.50'))
        self.assertEqual(marks.total_marks, Decimal('100.00'))
    
    def test_marks_validation_errors(self):
        """Test validation errors for invalid marks data"""
        # Test negative marks
        marks_data = {
            'student': self.student.id,
            'exam': self.exam.id,
            'subject': self.subject.id,
            'marks_obtained': '-10.00',
            'total_marks': '100.00'
        }
        
        serializer = MarksSerializer(data=marks_data)
        self.assertFalse(serializer.is_valid())
        
        # Test marks greater than total
        marks_data['marks_obtained'] = '110.00'
        serializer = MarksSerializer(data=marks_data)
        self.assertFalse(serializer.is_valid())


class ExamManagementViewTest(APITestCase):
    """Test cases for ExamManagementView"""
    
    def setUp(self):
        # Create admin user
        self.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        
        self.test_class = Class.objects.create(
            name="Grade 10A",
            grade_level=10,
            section="A"
        )
        
        self.exam = Exam.objects.create(
            name="Mid Term",
            exam_date=date.today() + timedelta(days=7),
            student_class=self.test_class
        )
    
    def test_get_exams_with_admin_permission(self):
        """Test GET request with admin permission"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = reverse('exam-management')
        response = self.client.get(url, {'class_grade': '10'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if response has pagination or direct results
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
            self.assertEqual(response.data['results'][0]['name'], 'Mid Term')
        else:
            self.assertEqual(len(response.data), 1)
            self.assertEqual(response.data[0]['name'], 'Mid Term')
    
    def test_get_exams_without_permission(self):
        """Test GET request without admin permission"""
        url = reverse('exam-management')
        response = self.client.get(url, {'class_grade': '10'})
        
        # DRF returns 403 for permission denied, not 401
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
    
    def test_create_exam_with_valid_data(self):
        """Test POST request to create exam with valid data"""
        self.client.force_authenticate(user=self.admin_user)
        
        exam_data = {
            'name': 'Final Exam',
            'exam_date': (date.today() + timedelta(days=30)).isoformat(),
            'student_class': self.test_class.id
        }
        
        url = reverse('exam-management')
        response = self.client.post(url, exam_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Final Exam')
    
    def test_create_exam_with_invalid_data(self):
        """Test POST request with invalid data"""
        self.client.force_authenticate(user=self.admin_user)
        
        exam_data = {
            'name': 'Invalid Exam',
            'exam_date': (date.today() - timedelta(days=2)).isoformat(),  # Past date
            'student_class': self.test_class.id
        }
        
        url = reverse('exam-management')
        response = self.client.post(url, exam_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class StudentMarksViewTest(APITestCase):
    """Test cases for StudentMarksView"""
    
    def setUp(self):
        # Create regular user (student)
        self.student_user = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='studentpass123'
        )
        
        self.test_class = Class.objects.create(
            name="Grade 10A",
            grade_level=10,
            section="A"
        )
        
        self.student = Student.objects.create(
            name="John Doe",
            email="john@example.com",
            password="password123",
            roll_id="2024001",
            student_class=self.test_class
        )
        
        self.subject = Subject.objects.create(
            name="Mathematics",
            code="MATH101",
            grade_levels="9,10,11,12"
        )
        
        self.exam = Exam.objects.create(
            name="Mid Term",
            exam_date=date.today() + timedelta(days=7),
            student_class=self.test_class
        )
        
        self.marks = Marks.objects.create(
            student=self.student,
            exam=self.exam,
            subject=self.subject,
            marks_obtained=Decimal('85.50'),
            total_marks=Decimal('100.00')
        )
    
    def test_get_student_marks_with_authentication(self):
        """Test GET request with authentication"""
        self.client.force_authenticate(user=self.student_user)
        
        url = reverse('student-marks')
        response = self.client.get(url, {'student_id': self.student.id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('marks_by_exam', response.data)
        self.assertEqual(len(response.data['marks_by_exam']), 1)
    
    def test_get_student_marks_without_authentication(self):
        """Test GET request without authentication"""
        url = reverse('student-marks')
        response = self.client.get(url, {'student_id': self.student.id})
        
        # DRF returns 403 for permission denied, not 401
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])