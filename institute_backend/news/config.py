"""
Configuration module for news scraping
"""

class ScrapingConfig:
    """Configuration settings for news scraping"""
    
    # Source configurations
    SOURCES = {
        'edutopia': {
            'enabled': True,
            'base_url': 'https://www.edutopia.org',
            'news_path': '/articles',
            'selectors': {
                'article_container': '.card-article, .teaser-card',
                'title': '.card-title a, .teaser-title a, h3 a',
                'url': '.card-title a, .teaser-title a, h3 a',
                'image': '.card-image img, .teaser-image img, .article-image img',
                'description': '.card-summary, .teaser-summary, .article-summary'
            },
            'max_articles': 6
        },
        'times_higher_ed': {
            'enabled': True,
            'base_url': 'https://www.timeshighereducation.com',
            'news_path': '/news',
            'selectors': {
                'article_container': '.teaser, .article-card',
                'title': '.teaser__title a, .article-title a, h3 a',
                'url': '.teaser__title a, .article-title a, h3 a',
                'image': '.teaser__image img, .article-image img',
                'description': '.teaser__summary, .article-summary'
            },
            'max_articles': 6
        }
    }
    
    # Scraping parameters
    REQUEST_TIMEOUT = 15
    MAX_RETRIES = 3
    RETRY_DELAY = 2  # seconds
    CACHE_DURATION = 3600  # 1 hour in seconds
    MAX_ARTICLES_TOTAL = 12
    
    # Request headers
    USER_AGENTS = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ]
    
    # Rate limiting
    REQUEST_DELAY = 1  # seconds between requests to same domain
    MAX_CONCURRENT_REQUESTS = 3
    
    # Content filtering
    MIN_TITLE_LENGTH = 10
    MAX_TITLE_LENGTH = 200
    MIN_DESCRIPTION_LENGTH = 20
    MAX_DESCRIPTION_LENGTH = 500
    
    # Fallback settings
    ENABLE_FALLBACK = True
    FALLBACK_ON_EMPTY = True