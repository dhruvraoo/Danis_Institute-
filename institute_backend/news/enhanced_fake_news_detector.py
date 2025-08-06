#!/usr/bin/env python3
"""
Enhanced Fake News Detector for Django Integration
Uses the retrained TF-IDF + Logistic Regression model
"""

import pickle
import os
import re
import logging

logger = logging.getLogger(__name__)

class EnhancedFakeNewsDetector:
    """Enhanced Fake News Detection System using TF-IDF + Logistic Regression"""
    
    def __init__(self, model_path=None):
        self.vectorizer = None
        self.model = None
        self.model_loaded = False
        
        if model_path is None:
            # Default path to enhanced model
            root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            model_path = os.path.join(root_dir, 'enhanced_model')
        
        self.model_path = model_path
        self.load_model()
    
    def preprocess_text(self, text):
        """Preprocess text using the same logic as training"""
        if not text or text.strip() == "":
            return ""
        
        # Convert to lowercase
        text = str(text).lower()
        
        # Remove special characters and digits, keep only letters and spaces
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Simple stopword removal (same as training)
        stopwords = {
            'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
            'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
            'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
            'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
            'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
            'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
            'while', 'of', 'at', 'by', 'for', 'with', 'through', 'during', 'before', 'after',
            'above', 'below', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
            'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
            'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
            'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just',
            'should', 'now'
        }
        
        # Remove stopwords and short words
        words = text.split()
        filtered_words = [word for word in words if word not in stopwords and len(word) > 2]
        
        return ' '.join(filtered_words)
    
    def load_model(self):
        """Load the enhanced model and vectorizer"""
        try:
            vectorizer_path = os.path.join(self.model_path, 'tfidf_vectorizer.pkl')
            model_path = os.path.join(self.model_path, 'fake_news_model.pkl')
            
            # Check if files exist
            if not os.path.exists(vectorizer_path) or not os.path.exists(model_path):
                logger.error(f"Enhanced model files not found in {self.model_path}")
                return False
            
            # Load vectorizer
            with open(vectorizer_path, 'rb') as f:
                self.vectorizer = pickle.load(f)
            
            # Load model
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            
            self.model_loaded = True
            logger.info("Enhanced fake news model loaded successfully!")
            return True
            
        except Exception as e:
            logger.error(f"Error loading enhanced model: {e}")
            self.model_loaded = False
            return False
    
    def predict(self, text):
        """
        Predict if a news article is fake or real
        
        Args:
            text (str): News article text
            
        Returns:
            tuple: (label, confidence) where label is 'Fake' or 'Real' 
                   and confidence is a float between 0 and 1
        """
        if not self.model_loaded:
            logger.error("Enhanced model not loaded")
            return "Error", 0.0
        
        if not text or len(text.strip()) < 10:
            logger.warning("Text too short for analysis")
            return "Error", 0.0
        
        try:
            # Preprocess text
            processed_text = self.preprocess_text(text)
            
            if not processed_text:
                logger.warning("Text became empty after preprocessing")
                return "Error", 0.0
            
            # Vectorize text
            text_tfidf = self.vectorizer.transform([processed_text])
            
            # Make prediction
            prediction = self.model.predict(text_tfidf)[0]
            probabilities = self.model.predict_proba(text_tfidf)[0]
            
            # Get label and confidence
            label = "Real" if prediction == 1 else "Fake"
            confidence = max(probabilities)
            
            logger.info(f"Prediction: {label} (Confidence: {confidence:.3f})")
            return label, confidence
            
        except Exception as e:
            logger.error(f"Error during prediction: {e}")
            return "Error", 0.0
    
    def get_model_info(self):
        """Get information about the loaded model"""
        if not self.model_loaded:
            return {"status": "not_loaded"}
        
        try:
            metadata_path = os.path.join(self.model_path, 'model_metadata.pkl')
            if os.path.exists(metadata_path):
                with open(metadata_path, 'rb') as f:
                    metadata = pickle.load(f)
                return {
                    "status": "loaded",
                    "model_type": metadata.get('model_type', 'Unknown'),
                    "performance": metadata.get('performance', {}),
                    "vectorizer_features": self.vectorizer.get_feature_names_out().shape[0] if hasattr(self.vectorizer, 'get_feature_names_out') else 'Unknown'
                }
            else:
                return {
                    "status": "loaded",
                    "model_type": type(self.model).__name__,
                    "vectorizer_features": self.vectorizer.get_feature_names_out().shape[0] if hasattr(self.vectorizer, 'get_feature_names_out') else 'Unknown'
                }
        except Exception as e:
            logger.error(f"Error getting model info: {e}")
            return {"status": "error", "error": str(e)}

# Global instance for Django integration
enhanced_detector = None

def get_enhanced_detector():
    """Get or create the enhanced detector instance"""
    global enhanced_detector
    if enhanced_detector is None:
        enhanced_detector = EnhancedFakeNewsDetector()
    return enhanced_detector

def predict_with_enhanced_model(text):
    """
    Convenience function for Django views
    
    Args:
        text (str): News article text
        
    Returns:
        dict: Prediction result with label, confidence, and metadata
    """
    detector = get_enhanced_detector()
    
    if not detector.model_loaded:
        return {
            "success": False,
            "error": "Enhanced model not available",
            "prediction": "Error",
            "confidence": 0.0
        }
    
    label, confidence = detector.predict(text)
    
    return {
        "success": True,
        "prediction": label,
        "confidence": confidence,
        "model_type": "Enhanced TF-IDF + Logistic Regression",
        "text_length": len(text),
        "processed": True
    }

# Test function
def test_enhanced_model():
    """Test the enhanced model with sample texts"""
    print("🧪 Testing Enhanced Fake News Detector")
    print("=" * 50)
    
    detector = EnhancedFakeNewsDetector()
    
    if not detector.model_loaded:
        print("❌ Model not loaded")
        return
    
    # Test cases
    test_cases = [
        {
            "text": "The Ministry of Education announced new digital learning initiatives for schools across India to improve educational outcomes.",
            "expected": "Real"
        },
        {
            "text": "Breaking: Government plans to implant tracking chips in all students to monitor their study habits through satellite technology.",
            "expected": "Fake"
        },
        {
            "text": "Universities are implementing AI-based assessment tools to provide better feedback to students and improve learning outcomes.",
            "expected": "Real"
        },
        {
            "text": "Shocking revelation: All textbooks will be replaced with holographic displays next month according to secret government documents.",
            "expected": "Fake"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        label, confidence = detector.predict(test_case["text"])
        status = "✅" if label == test_case["expected"] else "❌"
        
        print(f"\nTest {i}: {status}")
        print(f"Text: {test_case['text'][:80]}...")
        print(f"Expected: {test_case['expected']}")
        print(f"Predicted: {label} (Confidence: {confidence:.3f})")
    
    # Model info
    print(f"\n📊 Model Info:")
    info = detector.get_model_info()
    for key, value in info.items():
        print(f"{key}: {value}")

if __name__ == "__main__":
    test_enhanced_model()