from django.contrib import admin
from .models import BookRecommendation

# Register your models here.

@admin.register(BookRecommendation)
class BookRecommendationAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'subject', 'recommended_for_grade', 'is_available', 'display_price']
    list_filter = ['subject', 'recommended_for_grade', 'is_available', 'publication_year']
    search_fields = ['title', 'author', 'isbn', 'subject__name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Book Information', {
            'fields': ('title', 'author', 'subject', 'description')
        }),
        ('Publication Details', {
            'fields': ('isbn', 'publisher', 'publication_year')
        }),
        ('Recommendation Details', {
            'fields': ('recommended_for_grade', 'price', 'is_available')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('subject')
