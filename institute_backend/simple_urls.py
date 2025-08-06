"""
Simplified URL configuration for news scraping functionality
"""

from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'healthy', 'service': 'Django News Scraper'})

urlpatterns = [
    path('health/', health_check, name='health'),
    path('news/', include('news.urls')),
]
