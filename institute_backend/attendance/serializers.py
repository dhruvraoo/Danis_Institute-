from rest_framework import serializers
from .models import Attendance
from accounts.models import Student


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_roll_id = serializers.CharField(source='student.roll_id', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'student', 'student_name', 'student_roll_id', 'date', 'present']


class UserSerializer(serializers.ModelSerializer):
    student_class_name = serializers.CharField(source='student_class.name', read_only=True)
    student_class_grade = serializers.IntegerField(source='student_class.grade_level', read_only=True)
    
    class Meta:
        model = Student
        fields = ['id', 'name', 'roll_id', 'student_class_name', 'student_class_grade']