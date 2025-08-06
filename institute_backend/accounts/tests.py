from django.test import TestCase, Client
from django.urls import reverse
from .models import Student, Subject, Class
from students.models import StudentMark
from recommendations.models import BookRecommendation
from datetime import date
import json

# Create your tests here.

class StudentMarksAPITestCase(TestCase):
    def setUp(self):
        """Set up test data"""
        self.client = Client()
        
        # Create test class
        self.test_class = Class.objects.create(
            name="Grade 10A",
            grade_level=10,
            section="A"
        )
        
        # Create test subjects
        self.math_subject = Subject.objects.create(name="Mathematics", code="MATH101")
        self.science_subject = Subject.objects.create(name="Science", code="SCI101")
        self.english_subject = Subject.objects.create(name="English", code="ENG101")
        
        # Create test student
        self.student = Student.objects.create(
            name="Test Student",
            email="test@example.com",
            password="testpass",
            roll_id="2024001",
            student_class=self.test_class
        )
        
        # Add selected subjects
        self.student.subjects_selected.add(self.math_subject, self.science_subject)
        
        # Create test marks
        StudentMark.objects.create(
            student=self.student,
            subject=self.math_subject,
            exam_type="midterm",
            marks_obtained=85,
            total_marks=100,
            exam_date=date.today()
        )
        
        StudentMark.objects.create(
            student=self.student,
            subject=self.science_subject,
            exam_type="quiz",
            marks_obtained=90,
            total_marks=100,
            exam_date=date.today()
        )
    
    def test_marks_api_without_authentication(self):
        """Test marks API without authentication"""
        response = self.client.get(reverse('api_get_student_marks'))
        self.assertEqual(response.status_code, 401)
        data = json.loads(response.content)
        self.assertFalse(data['success'])
        self.assertEqual(data['error_code'], 'STUDENT_AUTHENTICATION_REQUIRED')
    
    def test_marks_api_with_authentication(self):
        """Test marks API with proper authentication"""
        # Simulate student login session
        session = self.client.session
        session['student_id'] = self.student.id
        session['user_type'] = 'student'
        session.save()
        
        response = self.client.get(reverse('api_get_student_marks'))
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.content)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['marks']), 2)  # Should return 2 marks
        self.assertEqual(data['subjects_count'], 2)  # Student has 2 selected subjects
        
        # Check if marks are only for selected subjects
        returned_subjects = [mark['subject']['name'] for mark in data['marks']]
        self.assertIn('Mathematics', returned_subjects)
        self.assertIn('Science', returned_subjects)
        self.assertNotIn('English', returned_subjects)  # Not selected by student
    
    def test_marks_api_no_subjects_selected(self):
        """Test marks API when student has no subjects selected"""
        # Create student with no subjects
        student_no_subjects = Student.objects.create(
            name="No Subjects Student",
            email="nosubjects@example.com",
            password="testpass",
            roll_id="2024002",
            student_class=self.test_class
        )
        
        # Simulate login session
        session = self.client.session
        session['student_id'] = student_no_subjects.id
        session['user_type'] = 'student'
        session.save()
        
        response = self.client.get(reverse('api_get_student_marks'))
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.content)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['marks']), 0)
        self.assertEqual(data['subjects_count'], 0)
        self.assertIn('No subjects selected', data['message'])


class BookRecommendationsAPITestCase(TestCase):
    def setUp(self):
        """Set up test data"""
        self.client = Client()
        
        # Create test class
        self.test_class = Class.objects.create(
            name="Grade 10A",
            grade_level=10,
            section="A"
        )
        
        # Create test subjects
        self.math_subject = Subject.objects.create(name="Mathematics", code="MATH101")
        self.science_subject = Subject.objects.create(name="Science", code="SCI101")
        self.english_subject = Subject.objects.create(name="English", code="ENG101")
        
        # Create test student
        self.student = Student.objects.create(
            name="Test Student",
            email="test@example.com",
            password="testpass",
            roll_id="2024001",
            student_class=self.test_class
        )
        
        # Add selected subjects
        self.student.subjects_selected.add(self.math_subject, self.science_subject)
        
        # Create test book recommendations
        BookRecommendation.objects.create(
            title="Advanced Mathematics",
            author="John Doe",
            subject=self.math_subject,
            description="Comprehensive math textbook",
            recommended_for_grade=10,
            price=500.00,
            is_available=True
        )
        
        BookRecommendation.objects.create(
            title="Science Fundamentals",
            author="Jane Smith",
            subject=self.science_subject,
            description="Basic science concepts",
            recommended_for_grade=10,
            price=450.00,
            is_available=True
        )
        
        # Create recommendation for non-selected subject
        BookRecommendation.objects.create(
            title="English Grammar",
            author="Bob Johnson",
            subject=self.english_subject,
            description="Grammar guide",
            recommended_for_grade=10,
            price=300.00,
            is_available=True
        )
    
    def test_book_recommendations_api_without_authentication(self):
        """Test book recommendations API without authentication"""
        response = self.client.get(reverse('api_get_book_recommendations'))
        self.assertEqual(response.status_code, 401)
        data = json.loads(response.content)
        self.assertFalse(data['success'])
        self.assertEqual(data['error_code'], 'STUDENT_AUTHENTICATION_REQUIRED')
    
    def test_book_recommendations_api_with_authentication(self):
        """Test book recommendations API with proper authentication"""
        # Simulate student login session
        session = self.client.session
        session['student_id'] = self.student.id
        session['user_type'] = 'student'
        session.save()
        
        response = self.client.get(reverse('api_get_book_recommendations'))
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.content)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['recommendations']), 2)  # Should return 2 recommendations
        self.assertEqual(data['subjects_count'], 2)  # Student has 2 selected subjects
        self.assertEqual(data['student_grade'], 10)
        
        # Check if recommendations are only for selected subjects
        returned_subjects = [rec['subject']['name'] for rec in data['recommendations']]
        self.assertIn('Mathematics', returned_subjects)
        self.assertIn('Science', returned_subjects)
        self.assertNotIn('English', returned_subjects)  # Not selected by student
    
    def test_book_recommendations_api_no_subjects_selected(self):
        """Test book recommendations API when student has no subjects selected"""
        # Create student with no subjects
        student_no_subjects = Student.objects.create(
            name="No Subjects Student",
            email="nosubjects@example.com",
            password="testpass",
            roll_id="2024002",
            student_class=self.test_class
        )
        
        # Simulate login session
        session = self.client.session
        session['student_id'] = student_no_subjects.id
        session['user_type'] = 'student'
        session.save()
        
        response = self.client.get(reverse('api_get_book_recommendations'))
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.content)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['recommendations']), 0)
        self.assertEqual(data['subjects_count'], 0)
        self.assertIn('No subjects selected', data['message'])


class SubjectUpdateAPITestCase(TestCase):
    def setUp(self):
        """Set up test data"""
        self.client = Client()
        
        # Create test class
        self.test_class = Class.objects.create(
            name="Grade 10A",
            grade_level=10,
            section="A"
        )
        
        # Create test subjects
        self.math_subject = Subject.objects.create(name="Mathematics", code="MATH101")
        self.science_subject = Subject.objects.create(name="Science", code="SCI101")
        self.english_subject = Subject.objects.create(name="English", code="ENG101")
        
        # Create test student
        self.student = Student.objects.create(
            name="Test Student",
            email="test@example.com",
            password="testpass",
            roll_id="2024001",
            student_class=self.test_class
        )
        
        # Initially add math subject
        self.student.subjects_selected.add(self.math_subject)
    
    def test_update_subjects_api_without_authentication(self):
        """Test subject update API without authentication"""
        response = self.client.post(
            reverse('api_update_student_subjects'),
            data=json.dumps({'subject_ids': [self.math_subject.id]}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
        data = json.loads(response.content)
        self.assertFalse(data['success'])
        self.assertEqual(data['error_code'], 'STUDENT_AUTHENTICATION_REQUIRED')
    
    def test_update_subjects_api_with_authentication(self):
        """Test subject update API with proper authentication"""
        # Simulate student login session
        session = self.client.session
        session['student_id'] = self.student.id
        session['user_type'] = 'student'
        session.save()
        
        # Update subjects to include math and science
        response = self.client.post(
            reverse('api_update_student_subjects'),
            data=json.dumps({'subject_ids': [self.math_subject.id, self.science_subject.id]}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.content)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['subjects']), 2)
        self.assertEqual(data['subjects_count'], 2)
        
        # Verify subjects were actually updated in database
        self.student.refresh_from_db()
        selected_subjects = list(self.student.subjects_selected.all())
        self.assertEqual(len(selected_subjects), 2)
        self.assertIn(self.math_subject, selected_subjects)
        self.assertIn(self.science_subject, selected_subjects)
    
    def test_update_subjects_api_with_invalid_ids(self):
        """Test subject update API with invalid subject IDs"""
        # Simulate student login session
        session = self.client.session
        session['student_id'] = self.student.id
        session['user_type'] = 'student'
        session.save()
        
        # Try to update with invalid subject ID
        response = self.client.post(
            reverse('api_update_student_subjects'),
            data=json.dumps({'subject_ids': [999, self.math_subject.id]}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.content)
        self.assertFalse(data['success'])
        self.assertEqual(data['error_code'], 'INVALID_SUBJECT_IDS')
        self.assertIn(999, data['details']['invalid_ids'])
    
    def test_update_subjects_api_with_invalid_json(self):
        """Test subject update API with invalid JSON"""
        # Simulate student login session
        session = self.client.session
        session['student_id'] = self.student.id
        session['user_type'] = 'student'
        session.save()
        
        # Send invalid JSON
        response = self.client.post(
            reverse('api_update_student_subjects'),
            data='invalid json',
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.content)
        self.assertFalse(data['success'])
        self.assertEqual(data['error_code'], 'INVALID_JSON')
