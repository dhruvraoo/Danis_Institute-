from rest_framework import serializers
from django.utils import timezone
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from accounts.models import Subject, Student, Class
from .models import Exam, Marks
import logging

logger = logging.getLogger(__name__)


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'grade_levels']


class ExamSerializer(serializers.ModelSerializer):
    student_class_name = serializers.CharField(source='student_class.name', read_only=True)
    
    class Meta:
        model = Exam
        fields = ['id', 'name', 'exam_date', 'student_class', 'student_class_name', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_exam_date(self, value):
        """Validate that exam date is not in the past"""
        if value < timezone.now().date():
            raise serializers.ValidationError(
                "Exam date cannot be in the past. Please select a future date."
            )
        
        # Check if exam date is too far in the future (optional business rule)
        max_future_date = timezone.now().date().replace(year=timezone.now().year + 1)
        if value > max_future_date:
            raise serializers.ValidationError(
                "Exam date cannot be more than one year in the future."
            )
        
        return value
    
    def validate_student_class(self, value):
        """Validate that student_class exists and is active"""
        try:
            if not Class.objects.filter(id=value.id).exists():
                raise serializers.ValidationError(
                    f"Student class with ID {value.id} does not exist."
                )
        except AttributeError:
            raise serializers.ValidationError("Invalid student class format.")
        
        return value
    
    def validate_name(self, value):
        """Validate exam name"""
        if not value or not value.strip():
            raise serializers.ValidationError("Exam name cannot be empty.")
        
        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Exam name must be at least 3 characters long."
            )
        
        return value.strip()


class MarksSerializer(serializers.ModelSerializer):
    percentage = serializers.ReadOnlyField()
    grade = serializers.ReadOnlyField()
    student_name = serializers.CharField(source='student.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    exam_name = serializers.CharField(source='exam.name', read_only=True)
    
    class Meta:
        model = Marks
        fields = [
            'id', 'student', 'exam', 'subject', 'marks_obtained', 'total_marks',
            'percentage', 'grade', 'student_name', 'subject_name', 'exam_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, data):
        """Comprehensive validation for marks data"""
        marks_obtained = data.get('marks_obtained')
        total_marks = data.get('total_marks')
        student = data.get('student')
        exam = data.get('exam')
        subject = data.get('subject')
        
        # Validate marks values
        if marks_obtained is not None and marks_obtained < 0:
            raise serializers.ValidationError({
                'marks_obtained': "Marks obtained cannot be negative."
            })
        
        if total_marks is not None and total_marks <= 0:
            raise serializers.ValidationError({
                'total_marks': "Total marks must be greater than zero."
            })
        
        if marks_obtained is not None and total_marks is not None:
            if marks_obtained > total_marks:
                raise serializers.ValidationError({
                    'marks_obtained': f"Marks obtained ({marks_obtained}) cannot be greater than total marks ({total_marks})."
                })
        
        # Validate business logic constraints
        if student and exam and subject:
            # Check if student belongs to the exam's class
            if student.student_class != exam.student_class:
                raise serializers.ValidationError({
                    'student': f"Student {student.name} does not belong to class {exam.student_class.name} for this exam."
                })
            
            # Check if subject is available for the student's grade level
            if not subject.is_available_for_grade(student.student_class.grade_level):
                raise serializers.ValidationError({
                    'subject': f"Subject {subject.name} is not available for grade {student.student_class.grade_level}."
                })
            
            # Check for duplicate marks (if this is a create operation)
            if not self.instance:  # Only check for duplicates on create
                existing_marks = Marks.objects.filter(
                    student=student,
                    exam=exam,
                    subject=subject
                ).exists()
                
                if existing_marks:
                    raise serializers.ValidationError({
                        'non_field_errors': f"Marks already exist for {student.name} in {subject.name} for {exam.name}."
                    })
        
        return data
    
    def create(self, validated_data):
        """Create marks with error handling"""
        try:
            return super().create(validated_data)
        except IntegrityError as e:
            logger.error(f"IntegrityError creating marks: {e}")
            raise serializers.ValidationError({
                'non_field_errors': "A marks record with these details already exists."
            })
        except Exception as e:
            logger.error(f"Error creating marks: {e}")
            raise serializers.ValidationError({
                'non_field_errors': "An error occurred while saving marks. Please try again."
            })
    
    def update(self, instance, validated_data):
        """Update marks with error handling"""
        try:
            return super().update(instance, validated_data)
        except Exception as e:
            logger.error(f"Error updating marks: {e}")
            raise serializers.ValidationError({
                'non_field_errors': "An error occurred while updating marks. Please try again."
            })


class StudentMarksSerializer(serializers.ModelSerializer):
    """Specialized serializer for student marks view with nested data"""
    exam = ExamSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    percentage = serializers.ReadOnlyField()
    grade = serializers.ReadOnlyField()
    
    class Meta:
        model = Marks
        fields = [
            'id', 'exam', 'subject', 'marks_obtained', 'total_marks',
            'percentage', 'grade', 'created_at'
        ]


class BulkMarksSerializer(serializers.Serializer):
    """Serializer for bulk marks creation/update"""
    student_id = serializers.IntegerField()
    marks = serializers.ListField(
        child=serializers.DictField(
            child=serializers.DecimalField(max_digits=5, decimal_places=2)
        )
    )
    
    def validate_student_id(self, value):
        """Validate that student exists"""
        if not Student.objects.filter(id=value).exists():
            raise serializers.ValidationError("Student does not exist.")
        return value
    
    def validate_marks(self, value):
        """Comprehensive validation for bulk marks data"""
        if not value:
            raise serializers.ValidationError("Marks list cannot be empty.")
        
        if len(value) > 20:  # Business rule: limit bulk operations
            raise serializers.ValidationError("Cannot process more than 20 marks at once.")
        
        subject_ids_seen = set()
        
        for i, mark_data in enumerate(value):
            # Check required fields
            required_fields = ['subject_id', 'marks_obtained', 'total_marks']
            missing_fields = [field for field in required_fields if field not in mark_data]
            
            if missing_fields:
                raise serializers.ValidationError(
                    f"Item {i+1}: Missing required fields: {', '.join(missing_fields)}"
                )
            
            # Validate data types
            try:
                subject_id = int(mark_data.get('subject_id'))
                marks_obtained = float(mark_data.get('marks_obtained'))
                total_marks = float(mark_data.get('total_marks'))
            except (ValueError, TypeError):
                raise serializers.ValidationError(
                    f"Item {i+1}: Invalid data types. All fields must be numeric."
                )
            
            # Validate marks values
            if marks_obtained < 0:
                raise serializers.ValidationError(
                    f"Item {i+1}: Marks obtained cannot be negative."
                )
            if total_marks <= 0:
                raise serializers.ValidationError(
                    f"Item {i+1}: Total marks must be greater than zero."
                )
            if marks_obtained > total_marks:
                raise serializers.ValidationError(
                    f"Item {i+1}: Marks obtained ({marks_obtained}) cannot be greater than total marks ({total_marks})."
                )
            
            # Check for duplicate subjects in the same request
            if subject_id in subject_ids_seen:
                raise serializers.ValidationError(
                    f"Item {i+1}: Duplicate subject ID {subject_id} in the same request."
                )
            subject_ids_seen.add(subject_id)
            
            # Validate subject exists
            try:
                subject = Subject.objects.get(id=subject_id)
            except Subject.DoesNotExist:
                raise serializers.ValidationError(
                    f"Item {i+1}: Subject with ID {subject_id} does not exist."
                )
            
            # Store subject object for further validation
            mark_data['_subject_obj'] = subject
        
        return value