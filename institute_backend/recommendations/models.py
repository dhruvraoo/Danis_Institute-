from django.db import models
from accounts.models import Subject

# Create your models here.

class BookRecommendation(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='book_recommendations')
    description = models.TextField()
    isbn = models.CharField(max_length=13, blank=True, null=True)
    recommended_for_grade = models.IntegerField()
    publisher = models.CharField(max_length=100, blank=True)
    publication_year = models.IntegerField(blank=True, null=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['subject__name', 'title']
        verbose_name = 'Book Recommendation'
        verbose_name_plural = 'Book Recommendations'
        indexes = [
            models.Index(fields=['subject', 'recommended_for_grade']),
            models.Index(fields=['is_available']),
            models.Index(fields=['title']),
        ]
    
    def __str__(self):
        return f"{self.title} by {self.author} ({self.subject.name})"
    
    @property
    def display_price(self):
        """Return formatted price string"""
        if self.price:
            return f"₹{self.price}"
        return "Price not available"
