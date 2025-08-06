#!/usr/bin/env python3
"""
Enhanced Fake News Detector using the retrained TF-IDF + Logistic Regression model
"""

import joblib
import pickle
import os
import re
import logging
from typing import Dict, Tuple

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    from nltk.stem import WordNetLemmatizer
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False
    logger.warning("NLTK not available, using basic preprocessing")

class EnhancedFakeNewsDetector:
    """Enhanced Fake News Detection using TF-IDF + Logistic Regression"""
    
    def __init__(self, model_path='enhanced_model'):
        self.model_path = model_path
        self.model = None
        self.vectorizer = None
        self.metadata = None
        self.lemmatizer = None
        self.stop_words = None
        self.is_loaded = False
        
        # Initialize NLTK components
        self._initialize_nltk()
        
        # Try to load the model
        self.load_model()
    
    def _initialize_nltk(self):
        """Initialize NLTK components with error handling"""
        if not NLTK_AVAILABLE:
            logger.warning("NLTK not available, using basic preprocessing")
            self.lemmatizer = None
            self.stop_words = set()
            return
            
        try:
            # Download required NLTK data if not present
            try:
                nltk.data.find('tokenizers/punkt')
            except LookupError:
                nltk.download('punkt', quiet=True)
            
            try:
                nltk.data.find('tokenizers/punkt_tab')
            except LookupError:
                nltk.download('punkt_tab', quiet=True)
            
            try:
                nltk.data.find('corpora/stopwords')
            except LookupError:
                nltk.download('stopwords', quiet=True)
            
            try:
                nltk.data.find('corpora/wordnet')
            except LookupError:
                nltk.download('wordnet', quiet=True)
            
            # Initialize components
            self.lemmatizer = WordNetLemmatizer()
            self.stop_words = set(stopwords.words('english'))
            
        except Exception as e:
            logger.warning(f"NLTK initialization failed: {e}")
            # Fallback to basic preprocessing
            self.lemmatizer = None
            self.stop_words = set()
    
    def load_model(self) -> bool:
        """Load the enhanced model and vectorizer"""
        try:
            # Check if model files exist
            model_file = os.path.join(self.model_path, 'fake_news_model.pkl')
            vectorizer_file = os.path.join(self.model_path, 'tfidf_vectorizer.pkl')
            metadata_file = os.path.join(self.model_path, 'model_metadata.pkl')
            
            if not all(os.path.exists(f) for f in [model_file, vectorizer_file]):
                logger.warning(f"Enhanced model files not found in {self.model_path}")
                return False
            
            # Load model components
            self.model = joblib.load(model_file)
            self.vectorizer = joblib.load(vectorizer_file)
            
            # Load metadata if available
            if os.path.exists(metadata_file):
                with open(metadata_file, 'rb') as f:
                    self.metadata = pickle.load(f)
            
            self.is_loaded = True
            logger.info("Enhanced fake news model loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load enhanced model: {e}")
            self.is_loaded = False
            return False
    
    def preprocess_text(self, text: str) -> str:
        """Preprocess text using the same logic as training"""
        if not text or text.strip() == "":
            return ""
        
        try:
            # Convert to lowercase
            text = str(text).lower()
            
            # Remove special characters and digits, keep only letters and spaces
            text = re.sub(r'[^a-zA-Z\s]', '', text)
            
            # Remove extra whitespace
            text = re.sub(r'\s+', ' ', text).strip()
            
            # If NLTK is available, use advanced preprocessing
            if NLTK_AVAILABLE and self.lemmatizer and self.stop_words:
                # Tokenize
                tokens = word_tokenize(text)
                
                # Remove stopwords and lemmatize
                processed_tokens = []
                for token in tokens:
                    if token not in self.stop_words and len(token) > 2:
                        lemmatized = self.lemmatizer.lemmatize(token)
                        processed_tokens.append(lemmatized)
                
                return ' '.join(processed_tokens)
            else:
                # Basic preprocessing fallback
                words = text.split()
                filtered_words = [word for word in words if len(word) > 2]
                return ' '.join(filtered_words)
                
        except Exception as e:
            logger.warning(f"Text preprocessing failed: {e}")
            # Return basic cleaned text
            return re.sub(r'[^a-zA-Z\s]', '', str(text).lower()).strip()
    
    def predict(self, text: str) -> Dict:
        """
        Predict if news is fake or real
        
        Args:
            text (str): News text to analyze
            
        Returns:
            Dict: Prediction results with confidence and metadata
        """
        if not self.is_loaded:
            raise Exception("Enhanced model not loaded")
        
        if not text or len(text.strip()) < 10:
            raise ValueError("Text must be at least 10 characters long")
        
        try:
            # Preprocess the text
            processed_text = self.preprocess_text(text)
            
            if not processed_text:
                raise ValueError("Text preprocessing resulted in empty string")
            
            # Vectorize the text
            text_tfidf = self.vectorizer.transform([processed_text])
            
            # Make prediction
            prediction = self.model.predict(text_tfidf)[0]
            prediction_proba = self.model.predict_proba(text_tfidf)[0]
            
            # Convert prediction to label
            label = "Real" if prediction == 1 else "Fake"
            confidence = max(prediction_proba)
            
            # Get model information
            model_type = self.metadata.get('model_type', 'Unknown') if self.metadata else 'Enhanced Model'
            
            return {
                'prediction': label,
                'confidence': float(confidence),
                'model_type': model_type,
                'text_length': len(text),
                'processed_length': len(processed_text),
                'fake_probability': float(prediction_proba[0]),
                'real_probability': float(prediction_proba[1])
            }
            
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            raise Exception(f"Prediction error: {str(e)}")
    
    def get_model_info(self) -> Dict:
        """Get information about the loaded model"""
        if not self.is_loaded:
            return {'status': 'not_loaded', 'error': 'Model not loaded'}
        
        info = {
            'status': 'loaded',
            'model_path': self.model_path,
            'model_type': type(self.model).__name__,
            'vectorizer_type': type(self.vectorizer).__name__,
            'nltk_available': self.lemmatizer is not None
        }
        
        if self.metadata:
            info.update({
                'training_performance': self.metadata.get('performance', {}),
                'model_params': self.metadata.get('model_params', {}),
                'vectorizer_params': self.metadata.get('vectorizer_params', {})
            })
        
        return info

# Global instance
enhanced_detector = None

def get_enhanced_detector():
    """Get or create the enhanced detector instance"""
    global enhanced_detector
    if enhanced_detector is None:
        enhanced_detector = EnhancedFakeNewsDetector()
    return enhanced_detector

def predict_with_enhanced_model(text: str) -> Dict:
    """
    Convenience function to predict with enhanced model
    
    Args:
        text (str): Text to analyze
        
    Returns:
        Dict: Prediction results
    """
    detector = get_enhanced_detector()
    if not detector.is_loaded:
        raise Exception("Enhanced model not available")
    
    return detector.predict(text)