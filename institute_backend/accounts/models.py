from django.db import models
from django.contrib.auth.hashers import make_password, check_password

class Subject(models.Model):
    name = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=10, unique=True)  # e.g., "MATH101"
    grade_levels = models.CharField(max_length=20, default="9,10,11,12")  # Comma-separated grade levels
    
    def __str__(self):
        return self.name
    
    def is_available_for_grade(self, grade_level):
        """Check if subject is available for given grade level"""
        available_grades = [int(g.strip()) for g in self.grade_levels.split(',')]
        return grade_level in available_grades

class Class(models.Model):
    name = models.CharField(max_length=20, unique=True)  # e.g., "Grade 9", "Class 10A"
    grade_level = models.IntegerField()  # e.g., 9, 10, 11, 12
    section = models.CharField(max_length=5, blank=True)  # e.g., "A", "B", "C"
    
    class Meta:
        verbose_name_plural = "Classes"
    
    def __str__(self):
        return self.name

class Student(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    roll_id = models.CharField(max_length=50)
    student_class = models.ForeignKey(Class, on_delete=models.CASCADE)
    subjects_selected = models.ManyToManyField(Subject, blank=True)

    def __str__(self):
        return self.name

class Faculty(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    classes = models.ManyToManyField(Class, blank=True)
    subjects = models.ManyToManyField(Subject, blank=True)

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def save(self, *args, **kwargs):
        if self.password and not self.password.startswith(('pbkdf2_', 'bcrypt', 'argon2')):
            self.set_password(self.password)
        super().save(*args, **kwargs)

    class Meta:
        verbose_name_plural = "Faculty"

    def __str__(self):
        return self.name

class Principal(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class AdminUser(models.Model):
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=128)  # Hashed password
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Admin User"
        verbose_name_plural = "Admin Users"
    
    def __str__(self):
        return self.username
    
    def set_password(self, raw_password):
        """Hash and set the password"""
        self.password = make_password(raw_password)
    
    def check_password(self, raw_password):
        """Check if the provided password matches the stored hash"""
        return check_password(raw_password, self.password)
    
    def save(self, *args, **kwargs):
        # If password doesn't look hashed, hash it
        if self.password and not self.password.startswith(('pbkdf2_', 'bcrypt', 'argon2')):
            self.set_password(self.password)
        super().save(*args, **kwargs)
