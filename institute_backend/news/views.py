from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.cache import cache_page
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
import logging

from .education_news_scraper import get_educational_news

def education_news_view(request):
    context = {'education_news': get_educational_news()}
    return render(request, 'news/education_news.html', context)

# Configure logging
logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["GET"])
@cache_page(60 * 30)  # Cache for 30 minutes
def api_educational_news(request):
    """
    API endpoint to get educational news articles as JSON.
    """
    return JsonResponse({
        'success': False,
        'error': 'Educational news scraper is not available.',
        'articles': [],
        'count': 0
    })

@csrf_exempt
@require_http_methods(["GET"])
def educational_news_api(request):
    """
    JSON API endpoint for educational news for React frontend.
    Enhanced with better error handling and fallback support.
    No caching - always fetches fresh news.
    """
    try:
        articles = get_educational_news()
        
        if articles and len(articles) > 0:
            # Check if we're using fallback data by looking for fallback titles (not placeholder images since some live articles might not have images)
            fallback_titles = [
                'AI and Machine Learning Transform Modern Education',
                'Global Higher Education Rankings Show Significant Changes',
                'Digital Learning Platforms See Unprecedented Growth'
            ]
            is_fallback = any(any(fallback_title in article.get('title', '') for fallback_title in fallback_titles) for article in articles)
            
            response = JsonResponse({
                'success': True,
                'articles': articles,
                'count': len(articles),
                'source': 'fallback' if is_fallback else 'live',
                'message': 'Showing sample educational news (API offline)' if is_fallback else 'Live educational news loaded successfully',
                'timestamp': timezone.now().isoformat()
            })
            
            # Add cache-busting headers
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            
            return response
        else:
            # No articles at all, return empty with fallback
            from .fallback_data import get_fallback_educational_news
            fallback_articles = get_fallback_educational_news()[:12]
            
            response = JsonResponse({
                'success': True,
                'articles': fallback_articles,
                'count': len(fallback_articles),
                'source': 'fallback',
                'message': 'Showing sample educational news (API offline)',
                'timestamp': timezone.now().isoformat()
            })
            
            # Add cache-busting headers
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            
            return response
            
    except Exception as e:
        logger.error(f"Error in educational_news_api: {e}")
        
        # Emergency fallback
        try:
            from .fallback_data import get_fallback_educational_news
            fallback_articles = get_fallback_educational_news()[:12]
            
            response = JsonResponse({
                'success': True,
                'articles': fallback_articles,
                'count': len(fallback_articles),
                'source': 'fallback',
                'message': 'Showing sample educational news (API offline)',
                'timestamp': timezone.now().isoformat()
            })
            
            # Add cache-busting headers
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            
            return response
        except:
            response = JsonResponse({
                'success': False,
                'articles': [],
                'count': 0,
                'error': 'Unable to load educational news',
                'message': 'Educational news service temporarily unavailable',
                'timestamp': timezone.now().isoformat()
            })
            
            # Add cache-busting headers even for errors
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            
            return response
