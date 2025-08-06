# Design Document

## Overview

This design implements a real-time educational news scraping system that integrates with the existing Django backend to provide current educational content. The system uses BeautifulSoup for web scraping, implements caching for performance, and maintains graceful fallback to sample data when scraping fails.

## Architecture

### Scraping Layer
- **Multi-Source Scraper**: Scrapes from multiple educational news sources
- **Content Parser**: Extracts title, URL, and image from different website structures
- **Error Handling**: Graceful degradation when sources are unavailable
- **Rate Limiting**: Prevents overwhelming target websites

### Caching Layer
- **Redis/Memory Cache**: Stores scraped articles to reduce API calls
- **Cache Invalidation**: Automatic refresh of cached content
- **Fallback Strategy**: Returns cached data when scraping fails
- **Performance Optimization**: Reduces response times for repeated requests

### API Integration Layer
- **Django Views**: Updated educational news API endpoint
- **Response Formatting**: Ensures compatibility with existing frontend
- **Async Processing**: Non-blocking scraping operations
- **Error Response**: Standardized error handling and fallback data

## Components and Interfaces

### 1. News Scraper Module (`institute_backend/news/scrapers/`)

#### Base Scraper Interface
```python
from abc import ABC, abstractmethod
from typing import List, Dict, Optional

class NewsArticle:
    def __init__(self, title: str, url: str, image: str, description: str = ""):
        self.title = title
        self.url = url
        self.image = image
        self.description = description

class BaseScraper(ABC):
    @abstractmethod
    async def scrape_articles(self, limit: int = 10) -> List[NewsArticle]:
        pass
    
    @abstractmethod
    def get_source_name(self) -> str:
        pass
```

#### Edutopia Scraper
```python
class EdutopiaScraper(BaseScraper):
    def __init__(self):
        self.base_url = "https://www.edutopia.org"
        self.news_url = f"{self.base_url}/articles"
    
    async def scrape_articles(self, limit: int = 10) -> List[NewsArticle]:
        # Implementation for scraping Edutopia articles
        pass
```

#### Times Higher Education Scraper
```python
class THEScraper(BaseScraper):
    def __init__(self):
        self.base_url = "https://www.timeshighereducation.com"
        self.news_url = f"{self.base_url}/news"
    
    async def scrape_articles(self, limit: int = 10) -> List[NewsArticle]:
        # Implementation for scraping THE articles
        pass
```

### 2. News Aggregator (`institute_backend/news/aggregator.py`)

```python
class NewsAggregator:
    def __init__(self):
        self.scrapers = [
            EdutopiaScraper(),
            THEScraper(),
            # Additional scrapers can be added here
        ]
        self.cache_timeout = 3600  # 1 hour
    
    async def get_aggregated_news(self, limit: int = 12) -> List[NewsArticle]:
        # Aggregate news from multiple sources
        pass
    
    def get_cached_news(self) -> Optional[List[NewsArticle]]:
        # Retrieve cached news articles
        pass
    
    def cache_news(self, articles: List[NewsArticle]) -> None:
        # Cache news articles
        pass
```

### 3. Updated Django Views (`institute_backend/news/views.py`)

```python
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .aggregator import NewsAggregator
import asyncio
import logging

@csrf_exempt
@require_http_methods(["GET"])
async def educational_news_api(request):
    """
    Enhanced educational news API with real-time scraping
    """
    aggregator = NewsAggregator()
    
    try:
        # Try to get fresh news
        articles = await aggregator.get_aggregated_news(limit=12)
        
        if articles:
            return JsonResponse({
                'success': True,
                'articles': [
                    {
                        'title': article.title,
                        'url': article.url,
                        'image': article.image,
                        'description': article.description
                    }
                    for article in articles
                ],
                'source': 'live',
                'timestamp': timezone.now().isoformat()
            })
    
    except Exception as e:
        logging.error(f"News scraping failed: {e}")
    
    # Fallback to cached or sample data
    cached_articles = aggregator.get_cached_news()
    if cached_articles:
        return JsonResponse({
            'success': True,
            'articles': [
                {
                    'title': article.title,
                    'url': article.url,
                    'image': article.image,
                    'description': article.description
                }
                for article in cached_articles
            ],
            'source': 'cached',
            'timestamp': timezone.now().isoformat()
        })
    
    # Final fallback to sample data
    return get_fallback_news_response()
```

### 4. Configuration Module (`institute_backend/news/config.py`)

```python
class ScrapingConfig:
    # Source configurations
    SOURCES = {
        'edutopia': {
            'enabled': True,
            'base_url': 'https://www.edutopia.org',
            'selectors': {
                'article': '.card-article',
                'title': '.card-title a',
                'url': '.card-title a',
                'image': '.card-image img'
            }
        },
        'times_higher_ed': {
            'enabled': True,
            'base_url': 'https://www.timeshighereducation.com',
            'selectors': {
                'article': '.teaser',
                'title': '.teaser__title a',
                'url': '.teaser__title a',
                'image': '.teaser__image img'
            }
        }
    }
    
    # Scraping parameters
    REQUEST_TIMEOUT = 10
    MAX_RETRIES = 3
    CACHE_DURATION = 3600  # 1 hour
    MAX_ARTICLES_PER_SOURCE = 6
    USER_AGENT = 'Educational News Aggregator 1.0'
```

## Data Models

### News Article Data Model
```python
@dataclass
class NewsArticle:
    title: str
    url: str
    image: str
    description: str = ""
    source: str = ""
    published_date: Optional[datetime] = None
    scraped_at: datetime = field(default_factory=datetime.now)
```

### API Response Model
```python
class EducationalNewsResponse:
    success: bool
    articles: List[Dict[str, str]]
    source: str  # 'live', 'cached', or 'fallback'
    timestamp: str
    error_message: Optional[str] = None
```

## Error Handling

### Scraping Error Hierarchy
```python
class ScrapingError(Exception):
    """Base exception for scraping errors"""
    pass

class NetworkError(ScrapingError):
    """Network-related scraping errors"""
    pass

class ParsingError(ScrapingError):
    """Content parsing errors"""
    pass

class RateLimitError(ScrapingError):
    """Rate limiting errors"""
    pass
```

### Error Handling Strategy
1. **Network Errors**: Retry with exponential backoff
2. **Parsing Errors**: Skip problematic articles, continue with others
3. **Rate Limiting**: Implement delays and respect robots.txt
4. **Complete Failure**: Fall back to cached then sample data

## Testing Strategy

### Unit Testing
- **Scraper Tests**: Mock HTTP responses and test parsing logic
- **Aggregator Tests**: Test article aggregation and deduplication
- **Cache Tests**: Test caching and invalidation logic
- **API Tests**: Test Django view responses and error handling

### Integration Testing
- **End-to-End**: Test complete scraping workflow
- **Error Scenarios**: Test fallback mechanisms
- **Performance**: Test response times and caching effectiveness
- **Source Reliability**: Test handling of source website changes

### Manual Testing Scenarios
1. **Normal Operation**: Verify live scraping works correctly
2. **Source Unavailable**: Test fallback when one source is down
3. **All Sources Down**: Test complete fallback to sample data
4. **Slow Response**: Test timeout handling
5. **Invalid Content**: Test parsing error handling

## Performance Considerations

### Caching Strategy
- **Memory Cache**: Fast access for frequently requested data
- **Cache Warming**: Pre-populate cache during low-traffic periods
- **Selective Refresh**: Update only stale cache entries
- **Cache Size Management**: Limit cache size to prevent memory issues

### Async Processing
- **Non-blocking Scraping**: Use asyncio for concurrent requests
- **Background Tasks**: Implement periodic cache refresh
- **Request Pooling**: Reuse HTTP connections for efficiency
- **Timeout Management**: Prevent hanging requests

### Rate Limiting
- **Request Delays**: Implement delays between requests to same source
- **Concurrent Limits**: Limit simultaneous requests per source
- **Robots.txt Compliance**: Respect website scraping policies
- **User Agent Rotation**: Use appropriate user agent strings

## Security Considerations

### Input Validation
- **URL Validation**: Ensure scraped URLs are safe
- **Content Sanitization**: Clean scraped content before storage
- **Image URL Validation**: Verify image URLs are accessible
- **XSS Prevention**: Sanitize titles and descriptions

### Rate Limiting Protection
- **IP-based Limiting**: Prevent abuse of scraping endpoints
- **Request Throttling**: Limit API calls per user/IP
- **Circuit Breaker**: Stop scraping if too many failures occur
- **Monitoring**: Log and alert on unusual scraping patterns

## Deployment Considerations

### Dependencies
```python
# requirements.txt additions
beautifulsoup4>=4.12.0
aiohttp>=3.8.0
lxml>=4.9.0
redis>=4.5.0  # for caching
fake-useragent>=1.4.0
```

### Environment Configuration
```python
# Django settings additions
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}

# News scraping settings
NEWS_SCRAPING = {
    'CACHE_TIMEOUT': 3600,
    'MAX_ARTICLES': 12,
    'REQUEST_TIMEOUT': 10,
    'ENABLED_SOURCES': ['edutopia', 'times_higher_ed']
}
```

### Monitoring and Logging
- **Scraping Success Rates**: Monitor successful vs failed scraping attempts
- **Response Times**: Track API response performance
- **Cache Hit Rates**: Monitor caching effectiveness
- **Error Logging**: Detailed logging for debugging scraping issues