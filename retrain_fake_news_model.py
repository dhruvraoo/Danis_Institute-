#!/usr/bin/env python3
"""
Enhanced Fake News Detection Model Training Script
Combines both CSV datasets and applies comprehensive preprocessing
"""

import pandas as pd
import numpy as np
import re
import pickle
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, classification_report, confusion_matrix
from sklearn.pipeline import Pipeline
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import warnings
warnings.filterwarnings('ignore')

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

class FakeNewsModelTrainer:
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        self.vectorizer = None
        self.best_model = None
        self.model_performance = {}
        
    def load_and_combine_datasets(self):
        """Load and combine both CSV datasets"""
        print("📊 Loading datasets...")
        
        # Load education news dataset
        df1 = pd.read_csv('education_news_dataset.csv')
        print(f"Education dataset: {len(df1)} rows")
        
        # Load fake news dataset  
        df2 = pd.read_csv('fake_news_education_dataset.csv')
        print(f"Fake news dataset: {len(df2)} rows")
        
        # Standardize column names
        df1 = df1.rename(columns={'content': 'text'})  # Rename content to text
        df2 = df2.rename(columns={'text': 'text'})     # Keep text as text
        
        # Combine datasets
        combined_df = pd.concat([df1, df2], ignore_index=True)
        print(f"Combined dataset: {len(combined_df)} rows")
        
        # Check label distribution
        label_counts = combined_df['label'].value_counts()
        print(f"Label distribution: {dict(label_counts)}")
        
        return combined_df
    
    def preprocess_text(self, text):
        """Comprehensive text preprocessing"""
        if pd.isna(text):
            return ""
        
        # Convert to lowercase
        text = str(text).lower()
        
        # Remove special characters and digits, keep only letters and spaces
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords and lemmatize
        processed_tokens = []
        for token in tokens:
            if token not in self.stop_words and len(token) > 2:
                lemmatized = self.lemmatizer.lemmatize(token)
                processed_tokens.append(lemmatized)
        
        return ' '.join(processed_tokens)
    
    def create_features(self, df):
        """Create combined features from title and text"""
        print("🔧 Creating features...")
        
        # Preprocess title and text separately
        df['processed_title'] = df['title'].apply(self.preprocess_text)
        df['processed_text'] = df['text'].apply(self.preprocess_text)
        
        # Combine title and text with more weight to title
        df['combined_text'] = df['processed_title'] + ' ' + df['processed_title'] + ' ' + df['processed_text']
        
        # Remove rows with empty combined text
        df = df[df['combined_text'].str.strip() != '']
        
        print(f"Features created for {len(df)} samples")
        return df
    
    def prepare_data(self):
        """Load, preprocess and prepare data for training"""
        # Load and combine datasets
        df = self.load_and_combine_datasets()
        
        # Create features
        df = self.create_features(df)
        
        # Prepare X and y
        X = df['combined_text'].values
        y = df['label'].values
        
        # Convert labels to binary (0 for fake, 1 for real)
        y_binary = np.array([1 if label == 'real' else 0 for label in y])
        
        print(f"Final dataset: {len(X)} samples")
        print(f"Real news: {sum(y_binary)} samples")
        print(f"Fake news: {len(y_binary) - sum(y_binary)} samples")
        
        return X, y_binary
    
    def create_vectorizer(self, X_train):
        """Create and fit TF-IDF vectorizer"""
        print("🔤 Creating TF-IDF vectorizer...")
        
        self.vectorizer = TfidfVectorizer(
            max_features=10000,
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.95,
            stop_words='english'
        )
        
        X_train_tfidf = self.vectorizer.fit_transform(X_train)
        print(f"TF-IDF matrix shape: {X_train_tfidf.shape}")
        
        return X_train_tfidf
    
    def train_models(self, X_train_tfidf, y_train):
        """Train multiple models with hyperparameter tuning"""
        print("🤖 Training models with hyperparameter tuning...")
        
        models = {
            'Logistic Regression': {
                'model': LogisticRegression(random_state=42, max_iter=1000),
                'params': {
                    'C': [0.1, 1, 10, 100],
                    'penalty': ['l1', 'l2'],
                    'solver': ['liblinear']
                }
            },
            'SVM': {
                'model': SVC(random_state=42, probability=True),
                'params': {
                    'C': [0.1, 1, 10],
                    'kernel': ['linear', 'rbf'],
                    'gamma': ['scale', 'auto']
                }
            },
            'Random Forest': {
                'model': RandomForestClassifier(random_state=42, n_estimators=100),
                'params': {
                    'max_depth': [10, 20, None],
                    'min_samples_split': [2, 5, 10],
                    'min_samples_leaf': [1, 2, 4]
                }
            }
        }
        
        best_score = 0
        best_model_name = None
        
        for name, config in models.items():
            print(f"\n🔍 Training {name}...")
            
            # Grid search with cross-validation
            grid_search = GridSearchCV(
                config['model'],
                config['params'],
                cv=5,
                scoring='f1',
                n_jobs=-1,
                verbose=0
            )
            
            grid_search.fit(X_train_tfidf, y_train)
            
            # Store results
            self.model_performance[name] = {
                'best_score': grid_search.best_score_,
                'best_params': grid_search.best_params_,
                'model': grid_search.best_estimator_
            }
            
            print(f"Best F1 Score: {grid_search.best_score_:.4f}")
            print(f"Best Parameters: {grid_search.best_params_}")
            
            # Track best model
            if grid_search.best_score_ > best_score:
                best_score = grid_search.best_score_
                best_model_name = name
                self.best_model = grid_search.best_estimator_
        
        print(f"\n🏆 Best Model: {best_model_name} (F1: {best_score:.4f})")
        return best_model_name
    
    def evaluate_model(self, X_test_tfidf, y_test):
        """Evaluate the best model on test set"""
        print("\n📊 Evaluating best model on test set...")
        
        # Predictions
        y_pred = self.best_model.predict(X_test_tfidf)
        y_pred_proba = self.best_model.predict_proba(X_test_tfidf)
        
        # Metrics
        accuracy = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        
        print(f"Test Accuracy: {accuracy:.4f}")
        print(f"Test F1 Score: {f1:.4f}")
        
        # Detailed classification report
        print("\n📋 Classification Report:")
        print(classification_report(y_test, y_pred, target_names=['Fake', 'Real']))
        
        # Confusion Matrix
        print("\n🔢 Confusion Matrix:")
        cm = confusion_matrix(y_test, y_pred)
        print(f"True Negatives (Fake correctly identified): {cm[0,0]}")
        print(f"False Positives (Fake predicted as Real): {cm[0,1]}")
        print(f"False Negatives (Real predicted as Fake): {cm[1,0]}")
        print(f"True Positives (Real correctly identified): {cm[1,1]}")
        
        return accuracy, f1
    
    def save_model_and_vectorizer(self):
        """Save the trained model and vectorizer"""
        print("\n💾 Saving model and vectorizer...")
        
        # Create model directory
        import os
        os.makedirs('enhanced_model', exist_ok=True)
        
        # Save vectorizer
        joblib.dump(self.vectorizer, 'enhanced_model/tfidf_vectorizer.pkl')
        print("✅ TF-IDF vectorizer saved")
        
        # Save model
        joblib.dump(self.best_model, 'enhanced_model/fake_news_model.pkl')
        print("✅ Best model saved")
        
        # Save model metadata
        metadata = {
            'model_type': type(self.best_model).__name__,
            'model_params': self.best_model.get_params(),
            'vectorizer_params': self.vectorizer.get_params(),
            'performance': self.model_performance
        }
        
        with open('enhanced_model/model_metadata.pkl', 'wb') as f:
            pickle.dump(metadata, f)
        print("✅ Model metadata saved")
        
        print(f"\n📁 Model files saved in 'enhanced_model/' directory")
    
    def test_saved_model(self, sample_texts):
        """Test the saved model with sample texts"""
        print("\n🧪 Testing saved model...")
        
        # Load saved components
        vectorizer = joblib.load('enhanced_model/tfidf_vectorizer.pkl')
        model = joblib.load('enhanced_model/fake_news_model.pkl')
        
        for i, text in enumerate(sample_texts, 1):
            # Preprocess text
            processed_text = self.preprocess_text(text)
            
            # Vectorize
            text_tfidf = vectorizer.transform([processed_text])
            
            # Predict
            prediction = model.predict(text_tfidf)[0]
            probability = model.predict_proba(text_tfidf)[0]
            
            label = "Real" if prediction == 1 else "Fake"
            confidence = max(probability)
            
            print(f"Test {i}: {label} (Confidence: {confidence:.3f})")
            print(f"Text: {text[:100]}...")
            print()
    
    def run_complete_training(self):
        """Run the complete training pipeline"""
        print("🚀 Starting Enhanced Fake News Detection Model Training")
        print("=" * 60)
        
        # Prepare data
        X, y = self.prepare_data()
        
        # Split data (80/20)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"\n📊 Data Split:")
        print(f"Training set: {len(X_train)} samples")
        print(f"Test set: {len(X_test)} samples")
        
        # Create TF-IDF features
        X_train_tfidf = self.create_vectorizer(X_train)
        X_test_tfidf = self.vectorizer.transform(X_test)
        
        # Train models
        best_model_name = self.train_models(X_train_tfidf, y_train)
        
        # Evaluate
        accuracy, f1 = self.evaluate_model(X_test_tfidf, y_test)
        
        # Save model
        self.save_model_and_vectorizer()
        
        # Test with sample texts
        sample_texts = [
            "The Ministry of Education announced new digital learning initiatives for schools across India.",
            "Breaking: Government plans to implant tracking chips in all students to monitor their study habits.",
            "Universities are implementing AI-based assessment tools to improve educational outcomes.",
            "Shocking revelation: All textbooks will be replaced with holographic displays next month."
        ]
        
        self.test_saved_model(sample_texts)
        
        print("\n" + "=" * 60)
        print("🎉 Training Complete!")
        print(f"🏆 Best Model: {best_model_name}")
        print(f"📊 Final Accuracy: {accuracy:.4f}")
        print(f"📊 Final F1 Score: {f1:.4f}")
        print("💾 Model and vectorizer saved in 'enhanced_model/' directory")

if __name__ == "__main__":
    trainer = FakeNewsModelTrainer()
    trainer.run_complete_training()