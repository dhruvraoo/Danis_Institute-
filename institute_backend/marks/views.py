from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db import transaction, IntegrityError
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.paginator import Paginator
from django.core.cache import cache
from accounts.models import Student, Subject, Class
from .models import Exam, Marks
from .serializers import (
    ExamSerializer, MarksSerializer, StudentMarksSerializer, 
    SubjectSerializer, BulkMarksSerializer
)
import logging

logger = logging.getLogger(__name__)


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination class for marks management"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class ExamManagementView(APIView):
    """
    API view for managing exams
    GET: List exams filtered by class_grade
    POST: Create new exam
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Get exams filtered by class_grade parameter"""
        try:
            class_grade = request.query_params.get('class_grade')
            
            if not class_grade:
                return Response(
                    {'error': 'class_grade parameter is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                class_grade = int(class_grade)
            except ValueError:
                return Response(
                    {'error': 'class_grade must be a valid integer'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Filter exams by class grade level with optimized query
            exams = Exam.objects.filter(
                student_class__grade_level=class_grade
            ).select_related('student_class').order_by('-exam_date', 'name')
            
            # Add pagination for large datasets
            paginator = StandardResultsSetPagination()
            page = paginator.paginate_queryset(exams, request)
            
            if page is not None:
                serializer = ExamSerializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)
            
            serializer = ExamSerializer(exams, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching exams: {e}")
            return Response(
                {'error': 'An error occurred while fetching exams'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        """Create a new exam"""
        try:
            serializer = ExamSerializer(data=request.data)
            
            if serializer.is_valid():
                try:
                    exam = serializer.save()
                    logger.info(f"Exam created successfully: {exam.name} for {exam.student_class.name}")
                    return Response(
                        ExamSerializer(exam).data, 
                        status=status.HTTP_201_CREATED
                    )
                except IntegrityError:
                    return Response(
                        {'error': 'An exam with this name already exists for the selected class and date'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                return Response(
                    {'error': 'Validation failed', 'details': serializer.errors}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            logger.error(f"Error creating exam: {e}")
            return Response(
                {'error': 'An error occurred while creating exam'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MarksManagementView(APIView):
    """
    API view for managing marks for a specific exam
    GET: Get subjects for student's class and existing marks
    POST: Bulk create/update marks for a student
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request, exam_id):
        """Get subjects and existing marks for a student in an exam"""
        try:
            # Validate exam exists
            exam = get_object_or_404(Exam, id=exam_id)
            
            student_id = request.query_params.get('student_id')
            if not student_id:
                return Response(
                    {'error': 'student_id parameter is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                student_id = int(student_id)
            except ValueError:
                return Response(
                    {'error': 'student_id must be a valid integer'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate student exists
            student = get_object_or_404(Student, id=student_id)
            
            # Get only subjects that the student has selected
            cache_key = f"student_subjects_{student.id}"
            subjects = cache.get(cache_key)
            
            if subjects is None:
                # Get subjects selected by the student
                subjects = list(student.subjects_selected.all().order_by('name'))
                
                # If no subjects are selected, fall back to all subjects for their grade
                if not subjects:
                    student_grade = student.student_class.grade_level
                    subjects = list(Subject.objects.filter(
                        grade_levels__contains=str(student_grade)
                    ).order_by('name'))
                
                cache.set(cache_key, subjects, 300)  # Cache for 5 minutes
            
            # Get existing marks for this student in this exam with optimized query
            existing_marks = Marks.objects.filter(
                student=student, 
                exam=exam
            ).select_related('subject', 'student', 'exam')
            
            # Serialize data
            subjects_data = SubjectSerializer(subjects, many=True).data
            marks_data = MarksSerializer(existing_marks, many=True).data
            
            return Response({
                'exam': ExamSerializer(exam).data,
                'student': {
                    'id': student.id,
                    'name': student.name,
                    'class': student.student_class.name
                },
                'subjects': subjects_data,
                'existing_marks': marks_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching marks data: {e}")
            return Response(
                {'error': 'An error occurred while fetching marks data'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request, exam_id):
        """Bulk create/update marks for a student in an exam"""
        try:
            # Validate exam exists
            exam = get_object_or_404(Exam, id=exam_id)
            
            # Validate request data
            serializer = BulkMarksSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    {'error': 'Validation failed', 'details': serializer.errors}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            student_id = serializer.validated_data['student_id']
            marks_data = serializer.validated_data['marks']
            
            student = get_object_or_404(Student, id=student_id)
            
            # Validate that student belongs to the exam's class
            if student.student_class != exam.student_class:
                return Response(
                    {'error': f'Student {student.name} does not belong to the class for this exam'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Use transaction to ensure data consistency
            with transaction.atomic():
                created_marks = []
                updated_marks = []
                errors = []
                
                for i, mark_data in enumerate(marks_data):
                    try:
                        subject = get_object_or_404(Subject, id=mark_data['subject_id'])
                        
                        # Validate subject is available for student's grade
                        if not subject.is_available_for_grade(student.student_class.grade_level):
                            errors.append(f"Subject {subject.name} is not available for grade {student.student_class.grade_level}")
                            continue
                        
                        # Validate that the student has selected this subject
                        if not student.subjects_selected.filter(id=subject.id).exists():
                            errors.append(f"Student {student.name} has not selected subject {subject.name}")
                            continue
                        
                        mark, created = Marks.objects.update_or_create(
                            student=student,
                            exam=exam,
                            subject=subject,
                            defaults={
                                'marks_obtained': mark_data['marks_obtained'],
                                'total_marks': mark_data['total_marks']
                            }
                        )
                        
                        # Validate the created/updated mark
                        try:
                            mark.full_clean()
                        except DjangoValidationError as ve:
                            errors.append(f"Validation error for {subject.name}: {ve}")
                            continue
                        
                        if created:
                            created_marks.append(mark)
                        else:
                            updated_marks.append(mark)
                            
                    except Exception as e:
                        errors.append(f"Error processing marks for item {i+1}: {str(e)}")
                
                if errors:
                    # If there are errors, rollback the transaction
                    transaction.set_rollback(True)
                    return Response(
                        {'error': 'Some marks could not be processed', 'details': errors}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Serialize response data
                all_marks = created_marks + updated_marks
                response_data = MarksSerializer(all_marks, many=True).data
                
                logger.info(f"Successfully processed {len(all_marks)} marks for student {student.name} in exam {exam.name}")
                
                return Response({
                    'message': f'Successfully processed {len(all_marks)} marks',
                    'created': len(created_marks),
                    'updated': len(updated_marks),
                    'marks': response_data
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            logger.error(f"Error saving marks: {e}")
            return Response(
                {'error': 'An error occurred while saving marks'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StudentMarksView(APIView):
    """
    API view for students to view their own marks
    GET: Get all marks for authenticated student, grouped by exam
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all marks for the authenticated student"""
        try:
            # Get the authenticated user (assuming it's a student)
            # Note: This assumes the user model is linked to Student model
            # You may need to adjust this based on your authentication setup
            
            # For now, we'll get student_id from query params or request data
            # In a real implementation, you'd get this from the authenticated user
            student_id = request.query_params.get('student_id')
            
            if not student_id:
                return Response(
                    {'error': 'student_id parameter is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                student_id = int(student_id)
            except ValueError:
                return Response(
                    {'error': 'student_id must be a valid integer'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            student = get_object_or_404(Student, id=student_id)
            
            # Get all marks for the student using optimized manager method
            marks = Marks.objects.get_student_marks_optimized(student)
            
            if not marks.exists():
                return Response({
                    'message': 'No marks found for this student',
                    'student': {
                        'id': student.id,
                        'name': student.name,
                        'class': student.student_class.name
                    },
                    'marks_by_exam': []
                }, status=status.HTTP_200_OK)
            
            # Group marks by exam
            marks_by_exam = {}
            for mark in marks:
                exam_id = mark.exam.id
                if exam_id not in marks_by_exam:
                    marks_by_exam[exam_id] = {
                        'exam': ExamSerializer(mark.exam).data,
                        'marks': []
                    }
                marks_by_exam[exam_id]['marks'].append(StudentMarksSerializer(mark).data)
            
            # Convert to list and sort by exam date (most recent first)
            marks_list = list(marks_by_exam.values())
            marks_list.sort(key=lambda x: x['exam']['exam_date'], reverse=True)
            
            return Response({
                'student': {
                    'id': student.id,
                    'name': student.name,
                    'class': student.student_class.name
                },
                'marks_by_exam': marks_list
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching student marks: {e}")
            return Response(
                {'error': 'An error occurred while fetching student marks'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )