from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime
from accounts.models import Student, Class
from .models import Attendance
from .serializers import AttendanceSerializer, UserSerializer


class AttendanceAdminView(APIView):
    """
    API view for admin attendance management
    GET: Fetch students and existing attendance for a specific class and date
    POST: Create or update attendance records for multiple students
    """
    
    def get(self, request):
        """
        Fetch students by class grade and existing attendance records for a given date
        Query Parameters:
        - class_grade (required): Integer (9, 10, 11, 12)
        - date (optional): Date string (YYYY-MM-DD), defaults to current date
        """
        try:
            # Get query parameters
            class_grade = request.query_params.get('class_grade')
            date_str = request.query_params.get('date')
            
            # Validate class_grade parameter
            if not class_grade:
                return Response({
                    'error': True,
                    'message': 'class_grade parameter is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                class_grade = int(class_grade)
                if class_grade not in [9, 10, 11, 12]:
                    raise ValueError("Invalid grade level")
            except ValueError:
                return Response({
                    'error': True,
                    'message': 'class_grade must be 9, 10, 11, or 12'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Parse date parameter or use current date
            if date_str:
                try:
                    attendance_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                except ValueError:
                    return Response({
                        'error': True,
                        'message': 'Invalid date format. Use YYYY-MM-DD'
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                attendance_date = timezone.now().date()
            
            # Get students for the specified class grade
            students = Student.objects.filter(
                student_class__grade_level=class_grade
            ).select_related('student_class')
            
            # Get existing attendance records for the date
            attendance_records = Attendance.objects.filter(
                student__student_class__grade_level=class_grade,
                date=attendance_date
            ).select_related('student')
            
            # Serialize data
            students_data = UserSerializer(students, many=True).data
            attendance_data = AttendanceSerializer(attendance_records, many=True).data
            
            return Response({
                'students': students_data,
                'attendance_records': attendance_data,
                'date': attendance_date.strftime('%Y-%m-%d'),
                'class_grade': class_grade
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': True,
                'message': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """
        Create or update attendance records for multiple students
        Request Body:
        {
            "date": "2025-08-03",
            "attendance_data": [
                {"student_id": 1, "present": true},
                {"student_id": 2, "present": false}
            ]
        }
        """
        try:
            # Get request data
            date_str = request.data.get('date')
            attendance_data = request.data.get('attendance_data', [])
            
            # Validate date
            if not date_str:
                return Response({
                    'error': True,
                    'message': 'date field is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                attendance_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({
                    'error': True,
                    'message': 'Invalid date format. Use YYYY-MM-DD'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate attendance data
            if not attendance_data or not isinstance(attendance_data, list):
                return Response({
                    'error': True,
                    'message': 'attendance_data must be a non-empty list'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            created_count = 0
            updated_count = 0
            errors = []
            
            # Process each attendance record
            for item in attendance_data:
                student_id = item.get('student_id')
                present = item.get('present')
                
                # Validate individual record
                if student_id is None or present is None:
                    errors.append(f'Missing student_id or present field in record: {item}')
                    continue
                
                try:
                    student = Student.objects.get(id=student_id)
                except Student.DoesNotExist:
                    errors.append(f'Student with id {student_id} does not exist')
                    continue
                
                # Create or update attendance record
                attendance_record, created = Attendance.objects.update_or_create(
                    student=student,
                    date=attendance_date,
                    defaults={'present': present}
                )
                
                if created:
                    created_count += 1
                else:
                    updated_count += 1
            
            # Prepare response
            response_data = {
                'success': True,
                'message': f'Attendance processed successfully',
                'created': created_count,
                'updated': updated_count,
                'date': attendance_date.strftime('%Y-%m-%d')
            }
            
            if errors:
                response_data['errors'] = errors
                response_data['partial_success'] = True
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': True,
                'message': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StudentAttendanceView(APIView):
    """
    API view for student attendance history
    GET: Fetch complete attendance history for a specific student
    """
    
    def get(self, request, student_id):
        """
        Fetch complete attendance records for a student with statistics
        URL Parameter:
        - student_id: Integer ID of the student
        Query Parameters:
        - start_date (optional): Start date for filtering (YYYY-MM-DD)
        - end_date (optional): End date for filtering (YYYY-MM-DD)
        """
        try:
            # Get student
            try:
                student = Student.objects.get(id=student_id)
            except Student.DoesNotExist:
                return Response({
                    'error': True,
                    'message': f'Student with id {student_id} does not exist'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get date filters if provided
            start_date_str = request.query_params.get('start_date')
            end_date_str = request.query_params.get('end_date')
            
            # Build query for attendance records
            attendance_query = Attendance.objects.filter(student=student)
            
            # Apply date filters if provided
            if start_date_str:
                try:
                    start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                    attendance_query = attendance_query.filter(date__gte=start_date)
                except ValueError:
                    return Response({
                        'error': True,
                        'message': 'Invalid start_date format. Use YYYY-MM-DD'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            if end_date_str:
                try:
                    end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                    attendance_query = attendance_query.filter(date__lte=end_date)
                except ValueError:
                    return Response({
                        'error': True,
                        'message': 'Invalid end_date format. Use YYYY-MM-DD'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get attendance records ordered by date (most recent first)
            attendance_records = attendance_query.order_by('-date')
            
            # Calculate statistics
            total_days = attendance_records.count()
            present_days = attendance_records.filter(present=True).count()
            absent_days = total_days - present_days
            attendance_percentage = round((present_days / total_days * 100), 2) if total_days > 0 else 0
            
            # Prepare attendance history data
            attendance_history = []
            for record in attendance_records:
                attendance_history.append({
                    'date': record.date.strftime('%Y-%m-%d'),
                    'present': record.present,
                    'status': 'Present' if record.present else 'Absent'
                })
            
            # Prepare student data
            student_data = {
                'id': student.id,
                'name': student.name,
                'roll_id': student.roll_id,
                'class': student.student_class.name if student.student_class else None,
                'grade_level': student.student_class.grade_level if student.student_class else None
            }
            
            # Prepare response
            response_data = {
                'student': student_data,
                'attendance_history': attendance_history,
                'summary': {
                    'total_days': total_days,
                    'present_days': present_days,
                    'absent_days': absent_days,
                    'attendance_percentage': attendance_percentage
                }
            }
            
            # Add date range info if filters were applied
            if start_date_str or end_date_str:
                response_data['date_range'] = {
                    'start_date': start_date_str,
                    'end_date': end_date_str
                }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': True,
                'message': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)