from django.test import TestCase
from django.utils import timezone
from django.db import IntegrityError
from datetime import date, timedelta
from accounts.models import Student, Class
from .models import Attendance
from .serializers import AttendanceSerializer, UserSerializer


class AttendanceModelTest(TestCase):
    """Test cases for Attendance model"""
    
    def setUp(self):
        """Set up test data"""
        # Create a test class
        self.test_class = Class.objects.create(
            name="Grade 9A",
            grade_level=9,
            section="A"
        )
        
        # Create test students
        self.student1 = Student.objects.create(
            name="John Doe",
            email="john@example.com",
            password="password123",
            roll_id="2024001",
            student_class=self.test_class
        )
        
        self.student2 = Student.objects.create(
            name="Jane Smith",
            email="jane@example.com",
            password="password123",
            roll_id="2024002",
            student_class=self.test_class
        )
        
        self.test_date = date.today()
    
    def test_attendance_creation(self):
        """Test creating an attendance record"""
        attendance = Attendance.objects.create(
            student=self.student1,
            date=self.test_date,
            present=True
        )
        
        self.assertEqual(attendance.student, self.student1)
        self.assertEqual(attendance.date, self.test_date)
        self.assertTrue(attendance.present)
        self.assertIsNotNone(attendance.created_at)
        self.assertIsNotNone(attendance.updated_at)
    
    def test_attendance_str_method(self):
        """Test string representation of attendance"""
        attendance = Attendance.objects.create(
            student=self.student1,
            date=self.test_date,
            present=True
        )
        
        expected_str = f"{self.student1.name} - {self.test_date} (Present)"
        self.assertEqual(str(attendance), expected_str)
        
        # Test absent status
        attendance.present = False
        attendance.save()
        expected_str = f"{self.student1.name} - {self.test_date} (Absent)"
        self.assertEqual(str(attendance), expected_str)
    
    def test_unique_constraint(self):
        """Test unique constraint for student and date"""
        # Create first attendance record
        Attendance.objects.create(
            student=self.student1,
            date=self.test_date,
            present=True
        )
        
        # Try to create duplicate record - should raise IntegrityError
        with self.assertRaises(IntegrityError):
            Attendance.objects.create(
                student=self.student1,
                date=self.test_date,
                present=False
            )
    
    def test_multiple_students_same_date(self):
        """Test multiple students can have attendance on same date"""
        attendance1 = Attendance.objects.create(
            student=self.student1,
            date=self.test_date,
            present=True
        )
        
        attendance2 = Attendance.objects.create(
            student=self.student2,
            date=self.test_date,
            present=False
        )
        
        self.assertEqual(Attendance.objects.count(), 2)
        self.assertNotEqual(attendance1.student, attendance2.student)
    
    def test_same_student_different_dates(self):
        """Test same student can have attendance on different dates"""
        date1 = self.test_date
        date2 = self.test_date + timedelta(days=1)
        
        attendance1 = Attendance.objects.create(
            student=self.student1,
            date=date1,
            present=True
        )
        
        attendance2 = Attendance.objects.create(
            student=self.student1,
            date=date2,
            present=False
        )
        
        self.assertEqual(Attendance.objects.count(), 2)
        self.assertEqual(attendance1.student, attendance2.student)
        self.assertNotEqual(attendance1.date, attendance2.date)


class AttendanceSerializerTest(TestCase):
    """Test cases for AttendanceSerializer"""
    
    def setUp(self):
        """Set up test data"""
        self.test_class = Class.objects.create(
            name="Grade 10B",
            grade_level=10,
            section="B"
        )
        
        self.student = Student.objects.create(
            name="Alice Johnson",
            email="alice@example.com",
            password="password123",
            roll_id="2024003",
            student_class=self.test_class
        )
        
        self.attendance = Attendance.objects.create(
            student=self.student,
            date=date.today(),
            present=True
        )
    
    def test_attendance_serializer_fields(self):
        """Test AttendanceSerializer includes correct fields"""
        serializer = AttendanceSerializer(self.attendance)
        data = serializer.data
        
        expected_fields = ['id', 'student', 'student_name', 'student_roll_id', 'date', 'present']
        self.assertEqual(set(data.keys()), set(expected_fields))
    
    def test_attendance_serializer_data(self):
        """Test AttendanceSerializer returns correct data"""
        serializer = AttendanceSerializer(self.attendance)
        data = serializer.data
        
        self.assertEqual(data['student'], self.student.id)
        self.assertEqual(data['student_name'], self.student.name)
        self.assertEqual(data['student_roll_id'], self.student.roll_id)
        self.assertEqual(data['date'], self.attendance.date.strftime('%Y-%m-%d'))
        self.assertEqual(data['present'], self.attendance.present)
    
    def test_attendance_serializer_read_only_fields(self):
        """Test that student_name and student_roll_id are read-only"""
        serializer = AttendanceSerializer(self.attendance)
        
        # These fields should be read-only
        self.assertTrue(serializer.fields['student_name'].read_only)
        self.assertTrue(serializer.fields['student_roll_id'].read_only)


class UserSerializerTest(TestCase):
    """Test cases for UserSerializer"""
    
    def setUp(self):
        """Set up test data"""
        self.test_class = Class.objects.create(
            name="Grade 11C",
            grade_level=11,
            section="C"
        )
        
        self.student = Student.objects.create(
            name="Bob Wilson",
            email="bob@example.com",
            password="password123",
            roll_id="2024004",
            student_class=self.test_class
        )
    
    def test_user_serializer_fields(self):
        """Test UserSerializer includes correct fields"""
        serializer = UserSerializer(self.student)
        data = serializer.data
        
        expected_fields = ['id', 'name', 'roll_id', 'student_class_name', 'student_class_grade']
        self.assertEqual(set(data.keys()), set(expected_fields))
    
    def test_user_serializer_data(self):
        """Test UserSerializer returns correct data"""
        serializer = UserSerializer(self.student)
        data = serializer.data
        
        self.assertEqual(data['id'], self.student.id)
        self.assertEqual(data['name'], self.student.name)
        self.assertEqual(data['roll_id'], self.student.roll_id)
        self.assertEqual(data['student_class_name'], self.test_class.name)
        self.assertEqual(data['student_class_grade'], self.test_class.grade_level)
    
    def test_user_serializer_multiple_students(self):
        """Test UserSerializer with multiple students"""
        students = [self.student]
        serializer = UserSerializer(students, many=True)
        data = serializer.data
        
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], self.student.name)


from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
import json


class AttendanceAdminViewTest(APITestCase):
    """Integration tests for AttendanceAdminView"""
    
    def setUp(self):
        """Set up test data"""
        # Create test classes
        self.class_9 = Class.objects.create(
            name="Grade 9",
            grade_level=9
        )
        
        self.class_10 = Class.objects.create(
            name="Grade 10",
            grade_level=10
        )
        
        # Create test students
        self.student_9a = Student.objects.create(
            name="Student 9A",
            email="student9a@example.com",
            password="password123",
            roll_id="2024009A",
            student_class=self.class_9
        )
        
        self.student_9b = Student.objects.create(
            name="Student 9B",
            email="student9b@example.com",
            password="password123",
            roll_id="2024009B",
            student_class=self.class_9
        )
        
        self.student_10a = Student.objects.create(
            name="Student 10A",
            email="student10a@example.com",
            password="password123",
            roll_id="2024010A",
            student_class=self.class_10
        )
        
        self.test_date = date.today()
        self.url = reverse('attendance-admin')
    
    def test_get_students_by_class_grade(self):
        """Test GET endpoint returns students for specified class grade"""
        response = self.client.get(self.url, {'class_grade': 9})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertIn('students', data)
        self.assertIn('attendance_records', data)
        self.assertEqual(len(data['students']), 2)  # Two grade 9 students
        self.assertEqual(data['class_grade'], 9)
    
    def test_get_with_existing_attendance(self):
        """Test GET endpoint with existing attendance records"""
        # Create attendance record
        Attendance.objects.create(
            student=self.student_9a,
            date=self.test_date,
            present=True
        )
        
        response = self.client.get(self.url, {
            'class_grade': 9,
            'date': self.test_date.strftime('%Y-%m-%d')
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertEqual(len(data['attendance_records']), 1)
        self.assertEqual(data['attendance_records'][0]['student_name'], 'Student 9A')
        self.assertTrue(data['attendance_records'][0]['present'])
    
    def test_get_missing_class_grade(self):
        """Test GET endpoint without class_grade parameter"""
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()
        self.assertTrue(data['error'])
        self.assertIn('class_grade parameter is required', data['message'])
    
    def test_get_invalid_class_grade(self):
        """Test GET endpoint with invalid class_grade"""
        response = self.client.get(self.url, {'class_grade': 13})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()
        self.assertTrue(data['error'])
        self.assertIn('class_grade must be 9, 10, 11, or 12', data['message'])
    
    def test_get_invalid_date_format(self):
        """Test GET endpoint with invalid date format"""
        response = self.client.get(self.url, {
            'class_grade': 9,
            'date': 'invalid-date'
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()
        self.assertTrue(data['error'])
        self.assertIn('Invalid date format', data['message'])
    
    def test_post_attendance_creation(self):
        """Test POST endpoint creates attendance records"""
        attendance_data = {
            'date': self.test_date.strftime('%Y-%m-%d'),
            'attendance_data': [
                {'student_id': self.student_9a.id, 'present': True},
                {'student_id': self.student_9b.id, 'present': False}
            ]
        }
        
        response = self.client.post(
            self.url,
            data=json.dumps(attendance_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertTrue(data['success'])
        self.assertEqual(data['created'], 2)
        self.assertEqual(data['updated'], 0)
        
        # Verify records were created
        self.assertEqual(Attendance.objects.count(), 2)
    
    def test_post_attendance_update(self):
        """Test POST endpoint updates existing attendance records"""
        # Create existing record
        Attendance.objects.create(
            student=self.student_9a,
            date=self.test_date,
            present=False
        )
        
        attendance_data = {
            'date': self.test_date.strftime('%Y-%m-%d'),
            'attendance_data': [
                {'student_id': self.student_9a.id, 'present': True}
            ]
        }
        
        response = self.client.post(
            self.url,
            data=json.dumps(attendance_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertTrue(data['success'])
        self.assertEqual(data['created'], 0)
        self.assertEqual(data['updated'], 1)
        
        # Verify record was updated
        updated_record = Attendance.objects.get(student=self.student_9a, date=self.test_date)
        self.assertTrue(updated_record.present)
    
    def test_post_missing_date(self):
        """Test POST endpoint without date field"""
        attendance_data = {
            'attendance_data': [
                {'student_id': self.student_9a.id, 'present': True}
            ]
        }
        
        response = self.client.post(
            self.url,
            data=json.dumps(attendance_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()
        self.assertTrue(data['error'])
        self.assertIn('date field is required', data['message'])
    
    def test_post_invalid_student_id(self):
        """Test POST endpoint with non-existent student ID"""
        attendance_data = {
            'date': self.test_date.strftime('%Y-%m-%d'),
            'attendance_data': [
                {'student_id': 99999, 'present': True}
            ]
        }
        
        response = self.client.post(
            self.url,
            data=json.dumps(attendance_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertTrue(data['partial_success'])
        self.assertIn('errors', data)
        self.assertEqual(data['created'], 0)


class StudentAttendanceViewTest(APITestCase):
    """Integration tests for StudentAttendanceView"""
    
    def setUp(self):
        """Set up test data"""
        self.test_class = Class.objects.create(
            name="Grade 12",
            grade_level=12
        )
        
        self.student = Student.objects.create(
            name="Test Student",
            email="teststudent@example.com",
            password="password123",
            roll_id="2024012",
            student_class=self.test_class
        )
        
        # Create attendance records
        self.date1 = date.today()
        self.date2 = date.today() - timedelta(days=1)
        self.date3 = date.today() - timedelta(days=2)
        
        Attendance.objects.create(student=self.student, date=self.date1, present=True)
        Attendance.objects.create(student=self.student, date=self.date2, present=False)
        Attendance.objects.create(student=self.student, date=self.date3, present=True)
    
    def test_get_student_attendance_history(self):
        """Test GET endpoint returns student attendance history"""
        url = reverse('student-attendance', kwargs={'student_id': self.student.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertIn('student', data)
        self.assertIn('attendance_history', data)
        self.assertIn('summary', data)
        
        # Check student data
        self.assertEqual(data['student']['name'], self.student.name)
        self.assertEqual(data['student']['roll_id'], self.student.roll_id)
        
        # Check attendance history
        self.assertEqual(len(data['attendance_history']), 3)
        
        # Check summary statistics
        summary = data['summary']
        self.assertEqual(summary['total_days'], 3)
        self.assertEqual(summary['present_days'], 2)
        self.assertEqual(summary['absent_days'], 1)
        self.assertEqual(summary['attendance_percentage'], 66.67)
    
    def test_get_nonexistent_student(self):
        """Test GET endpoint with non-existent student ID"""
        url = reverse('student-attendance', kwargs={'student_id': 99999})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        data = response.json()
        self.assertTrue(data['error'])
        self.assertIn('does not exist', data['message'])
    
    def test_get_with_date_filters(self):
        """Test GET endpoint with date range filters"""
        url = reverse('student-attendance', kwargs={'student_id': self.student.id})
        response = self.client.get(url, {
            'start_date': self.date2.strftime('%Y-%m-%d'),
            'end_date': self.date1.strftime('%Y-%m-%d')
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        # Should only return 2 records within date range
        self.assertEqual(len(data['attendance_history']), 2)
        self.assertEqual(data['summary']['total_days'], 2)
        self.assertIn('date_range', data)
    
    def test_get_invalid_date_filter(self):
        """Test GET endpoint with invalid date filter"""
        url = reverse('student-attendance', kwargs={'student_id': self.student.id})
        response = self.client.get(url, {'start_date': 'invalid-date'})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()
        self.assertTrue(data['error'])
        self.assertIn('Invalid start_date format', data['message'])
    
    def test_get_student_no_attendance(self):
        """Test GET endpoint for student with no attendance records"""
        new_student = Student.objects.create(
            name="New Student",
            email="newstudent@example.com",
            password="password123",
            roll_id="2024013",
            student_class=self.test_class
        )
        
        url = reverse('student-attendance', kwargs={'student_id': new_student.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertEqual(len(data['attendance_history']), 0)
        self.assertEqual(data['summary']['total_days'], 0)
        self.assertEqual(data['summary']['attendance_percentage'], 0)