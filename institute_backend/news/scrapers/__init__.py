"""
News Scrapers Package
Handles real-time scraping of educational news from various sources
"""

from .base_scraper import BaseScraper, NewsArticle
from .edutopia_scraper import EdutopiaScraper
from .the_scraper import THEScraper

__all__ = [
    'BaseScraper',
    'NewsArticle', 
    'EdutopiaScraper',
    'THEScraper'
]