from django.core.management.base import BaseCommand, CommandError
from django.db.utils import IntegrityError

from accounts.models import Subject, Class


class Command(BaseCommand):
    help = "Seed initial Class and Subject data (grades 9-12, core subjects)."

    DEFAULT_SUBJECTS = [
        {"name": "Maths", "code": "MATH", "grade_levels": "9,10,11,12"},
        {"name": "Chemistry", "code": "CHEM", "grade_levels": "9,10,11,12"},
        {"name": "Physics", "code": "PHYS", "grade_levels": "9,10,11,12"},
        {"name": "Biology", "code": "BIO", "grade_levels": "9,10,11,12"},
        {"name": "English", "code": "ENG", "grade_levels": "9,10,11,12"},
    ]

    DEFAULT_CLASSES = [
        {"name": "9th", "grade_level": 9},
        {"name": "10th", "grade_level": 10},
        {"name": "11th", "grade_level": 11},
        {"name": "12th", "grade_level": 12},
    ]

    def handle(self, *args, **options):
        created_subjects = 0
        for data in self.DEFAULT_SUBJECTS:
            try:
                subject, created = Subject.objects.update_or_create(
                    name=data["name"], defaults=data
                )
                if created:
                    created_subjects += 1
            except IntegrityError:
                # Skip duplicates gracefully
                continue

        created_classes = 0
        for data in self.DEFAULT_CLASSES:
            try:
                cls, created = Class.objects.update_or_create(
                    name=data["name"], defaults=data
                )
                if created:
                    created_classes += 1
            except IntegrityError:
                continue

        self.stdout.write(self.style.SUCCESS(
            f"Seeding complete. Subjects created: {created_subjects}, Classes created: {created_classes}."
        ))
