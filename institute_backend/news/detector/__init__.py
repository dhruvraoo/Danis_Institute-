"""
Fake News Detection Module
Contains all fake news detection related functionality
"""

from .fake_news_detector import FakeNewsDetector, predict_from_saved_model, train_with_custom_csv
from .fake_news_api import api_detect_fake_news, api_fake_news_status

# Also make the clean detector available
try:
    from .fake_news_detector_clean import FakeNewsDetector as FakeNewsDetectorClean
except ImportError:
    FakeNewsDetectorClean = None

# Training utilities
try:
    from .train_education_dataset import train_education_dataset
    from .train_with_csv import main as train_with_csv_main
    from .setup_fake_news_detector import main as setup_detector
except ImportError:
    train_education_dataset = None
    train_with_csv_main = None
    setup_detector = None

__all__ = [
    'FakeNewsDetector',
    'FakeNewsDetectorClean', 
    'predict_from_saved_model',
    'train_with_custom_csv',
    'train_education_dataset',
    'train_with_csv_main',
    'setup_detector',
    'api_detect_fake_news',
    'api_fake_news_status'
]