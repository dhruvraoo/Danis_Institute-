#!/usr/bin/env python3
"""
Complete Fake News Detector using BERT
- Uses Hugging Face's transformers and PyTorch
- Loads Kaggle Fake and Real News dataset
- Trains BERT model for binary classification
- Provides prediction function with confidence scores
"""

import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from transformers import (
    BertTokenizer, 
    BertForSequenceClassification, 
    get_linear_schedule_with_warmup
)
from torch.optim import AdamW
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, classification_report
import os
import warnings
from tqdm import tqdm
import pickle

warnings.filterwarnings('ignore')

class NewsDataset(Dataset):
    """Custom Dataset for news articles"""
    
    def __init__(self, texts, labels, tokenizer, max_length=512):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]
        
        # Tokenize text
        encoding = self.tokenizer(
            text,
            truncation=True,
            padding='max_length',
            max_length=self.max_length,
            return_tensors='pt'
        )
        
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }

class FakeNewsDetector:
    """Complete Fake News Detection System"""
    
    def __init__(self, model_name='bert-base-uncased', max_length=512):
        self.model_name = model_name
        self.max_length = max_length
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {self.device}")
        
        # Initialize tokenizer and model
        self.tokenizer = BertTokenizer.from_pretrained(model_name)
        self.model = BertForSequenceClassification.from_pretrained(
            model_name, 
            num_labels=2
        )
        self.model.to(self.device)
    
    def load_custom_csv(self, csv_path, text_column='text', label_column='label', title_column=None):
        """
        Load and prepare data from a custom CSV file
        
        Args:
            csv_path (str): Path to your CSV file
            text_column (str): Name of the column containing news text
            label_column (str): Name of the column containing labels (0=fake, 1=real)
            title_column (str): Optional column name for titles
            
        Returns:
            tuple: (X_train, X_test, y_train, y_test)
        """
        print(f"Loading custom CSV: {csv_path}")
        
        try:
            # Load the CSV file
            df = pd.read_csv(csv_path)
            print(f"Loaded {len(df)} rows from CSV")
            
            # Check required columns
            if text_column not in df.columns:
                print(f"Error: Column '{text_column}' not found in CSV")
                print(f"Available columns: {list(df.columns)}")
                return None, None, None, None
            
            if label_column not in df.columns:
                print(f"Error: Column '{label_column}' not found in CSV")
                print(f"Available columns: {list(df.columns)}")
                return None, None, None, None
            
            # Combine title and text if title column is provided
            if title_column and title_column in df.columns:
                df['combined_text'] = df[title_column].fillna('') + ' ' + df[text_column].fillna('')
                text_col = 'combined_text'
            else:
                text_col = text_column
            
            # Clean and filter data
            df = df.dropna(subset=[text_col, label_column])
            df = df[df[text_col].str.len() > 10]  # Remove very short texts
            
            # Convert labels to numeric if they're strings
            if df[label_column].dtype == 'object':
                unique_labels = df[label_column].unique()
                print(f"Found labels: {unique_labels}")
                
                # Try to map common label formats
                label_mapping = {}
                for label in unique_labels:
                    label_str = str(label).lower()
                    if label_str in ['fake', 'false', '0', 'f']:
                        label_mapping[label] = 0
                    elif label_str in ['real', 'true', '1', 't']:
                        label_mapping[label] = 1
                    else:
                        print(f"Warning: Unknown label '{label}'. Please ensure labels are 0/1 or fake/real")
                        return None, None, None, None
                
                df[label_column] = df[label_column].map(label_mapping)
            
            # Ensure labels are 0 and 1
            unique_labels = df[label_column].unique()
            if not all(label in [0, 1] for label in unique_labels):
                print(f"Error: Labels must be 0 (fake) or 1 (real). Found: {unique_labels}")
                return None, None, None, None
            
            # Shuffle the dataset
            df = df.sample(frac=1, random_state=42).reset_index(drop=True)
            
            print(f"Final dataset: {len(df)} articles")
            print(f"Fake news (0): {len(df[df[label_column] == 0])}")
            print(f"Real news (1): {len(df[df[label_column] == 1])}")
            
            # Split the data
            texts = df[text_col].tolist()
            labels = df[label_column].tolist()
            
            X_train, X_test, y_train, y_test = train_test_split(
                texts, labels, test_size=0.2, random_state=42, stratify=labels
            )
            
            return X_train, X_test, y_train, y_test
            
        except FileNotFoundError:
            print(f"Error: File '{csv_path}' not found")
            return None, None, None, None
        except Exception as e:
            print(f"Error loading CSV: {e}")
            return None, None, None, None
    
    def create_data_loaders(self, X_train, X_test, y_train, y_test, batch_size=16):
        """Create PyTorch DataLoaders"""
        print("Creating data loaders...")
        
        train_dataset = NewsDataset(X_train, y_train, self.tokenizer, self.max_length)
        test_dataset = NewsDataset(X_test, y_test, self.tokenizer, self.max_length)
        
        train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
        test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
        
        return train_loader, test_loader
    
    def train_model(self, train_loader, test_loader, epochs=3, learning_rate=2e-5):
        """Train the BERT model"""
        print(f"Starting training for {epochs} epochs...")
        
        # Optimizer and scheduler
        optimizer = AdamW(self.model.parameters(), lr=learning_rate)
        total_steps = len(train_loader) * epochs
        scheduler = get_linear_schedule_with_warmup(
            optimizer,
            num_warmup_steps=0,
            num_training_steps=total_steps
        )
        
        # Training loop
        self.model.train()
        for epoch in range(epochs):
            print(f"\nEpoch {epoch + 1}/{epochs}")
            total_loss = 0
            
            progress_bar = tqdm(train_loader, desc=f"Training Epoch {epoch + 1}")
            for batch in progress_bar:
                # Move batch to device
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                labels = batch['labels'].to(self.device)
                
                # Forward pass
                outputs = self.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    labels=labels
                )
                
                loss = outputs.loss
                total_loss += loss.item()
                
                # Backward pass
                optimizer.zero_grad()
                loss.backward()
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
                optimizer.step()
                scheduler.step()
                
                progress_bar.set_postfix({'loss': loss.item()})
            
            avg_loss = total_loss / len(train_loader)
            print(f"Average training loss: {avg_loss:.4f}")
            
            # Evaluate after each epoch
            self.evaluate_model(test_loader)
    
    def evaluate_model(self, test_loader):
        """Evaluate the model"""
        print("Evaluating model...")
        
        self.model.eval()
        predictions = []
        true_labels = []
        
        with torch.no_grad():
            for batch in tqdm(test_loader, desc="Evaluating"):
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                labels = batch['labels'].to(self.device)
                
                outputs = self.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask
                )
                
                logits = outputs.logits
                preds = torch.argmax(logits, dim=1)
                
                predictions.extend(preds.cpu().numpy())
                true_labels.extend(labels.cpu().numpy())
        
        # Calculate metrics
        accuracy = accuracy_score(true_labels, predictions)
        f1 = f1_score(true_labels, predictions)
        
        print(f"Accuracy: {accuracy:.4f}")
        print(f"F1 Score: {f1:.4f}")
        print("\nClassification Report:")
        print(classification_report(true_labels, predictions, 
                                  target_names=['Fake', 'Real']))
        
        return accuracy, f1
    
    def save_model(self, save_path='./saved_model'):
        """Save the trained model and tokenizer"""
        print(f"Saving model to {save_path}...")
        
        os.makedirs(save_path, exist_ok=True)
        
        # Save model and tokenizer
        self.model.save_pretrained(save_path)
        self.tokenizer.save_pretrained(save_path)
        
        # Save additional info
        model_info = {
            'model_name': self.model_name,
            'max_length': self.max_length,
            'device': str(self.device)
        }
        
        with open(os.path.join(save_path, 'model_info.pkl'), 'wb') as f:
            pickle.dump(model_info, f)
        
        print("Model saved successfully!")
    
    def load_model(self, load_path='./saved_model'):
        """Load a saved model"""
        print(f"Loading model from {load_path}...")
        
        try:
            # Load model info
            with open(os.path.join(load_path, 'model_info.pkl'), 'rb') as f:
                model_info = pickle.load(f)
            
            # Load tokenizer and model
            self.tokenizer = BertTokenizer.from_pretrained(load_path)
            self.model = BertForSequenceClassification.from_pretrained(load_path)
            self.model.to(self.device)
            
            self.max_length = model_info['max_length']
            print("Model loaded successfully!")
            return True
            
        except Exception as e:
            print(f"Error loading model: {e}")
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
        self.model.eval()
        
        # Tokenize input
        encoding = self.tokenizer(
            text,
            truncation=True,
            padding='max_length',
            max_length=self.max_length,
            return_tensors='pt'
        )
        
        # Move to device
        input_ids = encoding['input_ids'].to(self.device)
        attention_mask = encoding['attention_mask'].to(self.device)
        
        # Make prediction
        with torch.no_grad():
            outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=1)
            
            predicted_class = torch.argmax(logits, dim=1).item()
            confidence = probabilities[0][predicted_class].item()
        
        label = 'Real' if predicted_class == 1 else 'Fake'
        
        return label, confidence

def predict_from_saved_model(text, model_path='./saved_model'):
    """
    Standalone function to make predictions using a saved model
    
    Args:
        text (str): News article text to classify
        model_path (str): Path to saved model directory
        
    Returns:
        tuple: (label, confidence)
    """
    detector = FakeNewsDetector()
    
    if detector.load_model(model_path):
        return detector.predict(text)
    else:
        return None, None

def train_with_custom_csv(csv_path, text_column='text', label_column='label', title_column=None, epochs=3):
    """
    Convenience function to train the model with a custom CSV file
    
    Args:
        csv_path (str): Path to your CSV file
        text_column (str): Column name containing the news text
        label_column (str): Column name containing labels (0=fake, 1=real)
        title_column (str): Optional column name for titles
        epochs (int): Number of training epochs
    """
    print("=== Training Fake News Detector with Custom CSV ===\n")
    
    # Initialize detector
    detector = FakeNewsDetector()
    
    # Load custom CSV data
    X_train, X_test, y_train, y_test = detector.load_custom_csv(
        csv_path, text_column, label_column, title_column
    )
    
    if X_train is None:
        print("Failed to load data. Please check your CSV file and column names.")
        return None
    
    # Create data loaders
    train_loader, test_loader = detector.create_data_loaders(
        X_train, X_test, y_train, y_test, batch_size=16
    )
    
    # Train model
    detector.train_model(train_loader, test_loader, epochs=epochs)
    
    # Save model
    detector.save_model()
    
    print("\n=== Training Complete ===")
    print("Model saved to ./saved_model/")
    
    return detector