#!/usr/bin/env python3
"""
Django API wrapper for Fake News Detector
- Provides Django views for fake news detection
- Integrates with the BERT model
- Returns JSON responses for React frontend
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import os
import sys
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Import from the same directory
try:
    from .fake_news_detector import FakeNewsDetector, predict_from_saved_model
    DETECTOR_AVAILABLE = True
except ImportError:
    DETECTOR_AVAILABLE = False
    print("Warning: fake_news_detector module not available")

# Import enhanced detector
try:
    from .enhanced_fake_news_detector import get_enhanced_detector, predict_with_enhanced_model
    ENHANCED_DETECTOR_AVAILABLE = True
except ImportError:
    ENHANCED_DETECTOR_AVAILABLE = False
    print("Warning: enhanced_fake_news_detector module not available")

# Import enhanced detector
try:
    from ..enhanced_fake_news_detector import predict_with_enhanced_model, get_enhanced_detector
    ENHANCED_DETECTOR_AVAILABLE = True
except ImportError:
    ENHANCED_DETECTOR_AVAILABLE = False
    print("Warning: enhanced_fake_news_detector module not available")

# Global detector instance
detector = None

def initialize_detector():
    """Initialize the fake news detector"""
    global detector
    if DETECTOR_AVAILABLE and detector is None:
        try:
            detector = FakeNewsDetector()
            
            # Get the project root directory (where saved_model should be)
            current_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.join(current_dir, '..', '..', '..')
            project_root = os.path.abspath(project_root)
            
            # Try multiple possible model paths
            possible_paths = [
                os.path.join(project_root, 'saved_model'),
                './saved_model',
                '../saved_model',
                '../../saved_model',
                '../../../saved_model',
            ]
            
            model_path = None
            for path in possible_paths:
                abs_path = os.path.abspath(path)
                print(f"Checking path: {abs_path}")
                if os.path.exists(abs_path) and os.path.exists(os.path.join(abs_path, 'config.json')):
                    model_path = abs_path
                    print(f"Found model at: {model_path}")
                    break
            
            if model_path and detector.load_model(model_path):
                print("Fake news detector loaded successfully!")
                return True
            else:
                print("Failed to load saved model")
                print(f"Tried paths: {[os.path.abspath(p) for p in possible_paths]}")
                return False
        except Exception as e:
            print(f"Error initializing detector: {e}")
            import traceback
            traceback.print_exc()
            return False
    return detector is not None

@csrf_exempt
@require_http_methods(["POST"])
def api_detect_fake_news(request):
    """
    Django API endpoint for fake news detection
    
    Expected JSON payload:
    {
        "text": "News article text to analyze"
    }
    
    Returns:
    {
        "success": true/false,
        "prediction": "Fake"/"Real",
        "confidence": 0.95,
        "message": "Analysis complete"
    }
    """
    try:
        # Parse request data
        data = json.loads(request.body)
        text = data.get('text', '').strip()
        
        if not text:
            return JsonResponse({
                'success': False,
                'message': 'No text provided for analysis'
            }, status=400)
        
        if len(text) < 50:
            return JsonResponse({
                'success': False,
                'message': 'Text too short for reliable analysis (minimum 50 characters)'
            }, status=400)
        
        # Initialize detector if not already done
        if not initialize_detector():
            # Return mock prediction for demo purposes when model is not available
            import random
            is_real = random.random() > 0.5
            return JsonResponse({
                'success': True,
                'prediction': 'Real' if is_real else 'Fake',
                'confidence': round(random.uniform(0.7, 0.95), 4),
                'message': f'Analysis complete (Demo Mode). The news appears to be {"real" if is_real else "fake"}.',
                'demo_mode': True,
                'analysis_details': {
                    'text_length': len(text),
                    'model_confidence': round((random.uniform(0.7, 0.95)) * 100, 2)
                }
            })
        
        # Try enhanced model first
        logger.info(f"Enhanced detector available: {ENHANCED_DETECTOR_AVAILABLE}")
        if ENHANCED_DETECTOR_AVAILABLE:
            try:
                logger.info("Attempting enhanced model prediction...")
                result = predict_with_enhanced_model(text)
                logger.info(f"Enhanced model result: {result}")
                
                return JsonResponse({
                    'success': True,
                    'prediction': result['prediction'],
                    'confidence': round(result['confidence'], 4),
                    'message': f'Analysis complete. The news appears to be {result["prediction"].lower()}.',
                    'demo_mode': False,
                    'analysis_details': {
                        'text_length': result['text_length'],
                        'processed_length': result['processed_length'],
                        'model_used': f"Enhanced {result['model_type']}",
                        'model_confidence': round(result['confidence'] * 100, 2),
                        'confidence_level': 'High' if result['confidence'] > 0.8 else 'Medium' if result['confidence'] > 0.6 else 'Low',
                        'fake_probability': round(result['fake_probability'] * 100, 2),
                        'real_probability': round(result['real_probability'] * 100, 2)
                    }
                })
            except Exception as e:
                logger.error(f"Enhanced model prediction failed: {e}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
        
        # Fallback to original model
        if detector is not None:
            try:
                label, confidence = detector.predict(text)
                
                return JsonResponse({
                    'success': True,
                    'prediction': label,
                    'confidence': round(confidence, 4),
                    'message': f'Analysis complete. The news appears to be {label.lower()}.',
                    'demo_mode': False,
                    'analysis_details': {
                        'text_length': len(text),
                        'model_used': 'BERT-based (Fallback)',
                        'model_confidence': round(confidence * 100, 2)
                    }
                })
            except Exception as e:
                logger.error(f"Original model prediction failed: {e}")
        
        # Final fallback - demo mode
        return JsonResponse({
            'success': True,
            'prediction': 'Real',
            'confidence': 0.75,
            'message': 'Analysis complete (Demo mode - model not available)',
            'demo_mode': True,
            'analysis_details': {
                'text_length': len(text),
                'model_used': 'Demo Mode',
                'model_confidence': 75.0
            }
        })
    
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Server error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def api_fake_news_status(request):
    """
    Check if the fake news detector is available and ready
    """
    try:
        # Check for model in multiple locations
        possible_paths = [
            './saved_model',
            '../saved_model',
            '../../saved_model',
            '../../../saved_model',
        ]
        
        model_available = False
        for path in possible_paths:
            if os.path.exists(os.path.abspath(path)):
                model_available = True
                break
        
        detector_ready = initialize_detector()
        
        return JsonResponse({
            'success': True,
            'detector_available': DETECTOR_AVAILABLE,
            'model_saved': model_available,
            'detector_ready': detector_ready,
            'demo_mode': not detector_ready,
            'message': 'Detector status retrieved successfully'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error checking detector status: {str(e)}'
        }, status=500)