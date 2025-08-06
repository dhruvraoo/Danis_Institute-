# Fake News Detector Module

This module contains all fake news detection functionality for the Django application.

## Files

- `fake_news_detector.py` - Main BERT-based fake news detection class
- `fake_news_api.py` - Django API views for fake news detection
- `train_education_dataset.py` - Training script for the education dataset
- `__init__.py` - Module initialization and exports

## Usage

### Import the detector in Django views:
```python
from news.detector import FakeNewsDetector, api_detect_fake_news
```

### Train a new model:
```python
from news.detector.train_education_dataset import train_education_dataset
train_education_dataset()
```

### API Endpoints:
- `POST /accounts/api/fake-news/detect/` - Detect fake news
- `GET /accounts/api/fake-news/status/` - Check detector status

## Model Location
The trained model should be saved in the project root directory as `saved_model/`.