"""
URL configuration for news app
"""

from django.urls import path
from . import views
from .detector import fake_news_api

app_name = 'news'

urlpatterns = [
    path('api/educational-news/', views.educational_news_api, name='api_educational_news'),  # Updated to use the working function
    path('education-news/', views.education_news_view, name='education_news'),
    path('api/educational-news-react/', views.educational_news_api, name='educational_news_api'),  # Keep for backward compatibility
    # Fake News Detection API endpoints
    path('api/detect-fake-news/', fake_news_api.api_detect_fake_news, name='api_detect_fake_news'),
    path('api/fake-news-status/', fake_news_api.api_fake_news_status, name='api_fake_news_status'),
]
