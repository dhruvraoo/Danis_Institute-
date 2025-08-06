#!/usr/bin/env python3
"""
Train Fake News Detector with the New Education News Dataset
Specifically designed for education_news_dataset.csv
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

def load_education_news_dataset(csv_path='../../../../education_news_dataset.csv'):
    """Load and prepare the new education news dataset"""
    print(f"Loading dataset: {csv_path}")
    
    try:
        # Load the CSV file
        df = pd.read_csv(csv_path)
        print(f"Loaded {len(df)} articles")
        
        # Check the structure
        print(f"Columns: {list(df.columns)}")
        print(f"Sample data:")
        print(df.head(3))
        
        # Combine title and content (note: using 'content' instead of 'text')
        df['combined_text'] = df['title'].fillna('') + ' ' + df['content'].fillna('')
        
        # Convert text labels to numeric
        label_mapping = {'fake': 0, 'real': 1}
        df['numeric_label'] = df['label'].map(label_mapping)
        
        # Check label distribution
        print(f"\nLabel distribution:")
        print(df['label'].value_counts())
        
        # Clean and filter data
        df = df.dropna(subset=['combined_text', 'numeric_label'])
        df = df[df['combined_text'].str.len() > 10]
        
        # Shuffle the dataset
        df = df.sample(frac=1, random_state=42).reset_index(drop=True)
        
        print(f"\nFinal dataset: {len(df)} articles")
        print(f"Fake news: {len(df[df['numeric_label'] == 0])}")
        print(f"Real news: {len(df[df['numeric_label'] == 1])}")
        
        # Split the data
        texts = df['combined_text'].tolist()
        labels = df['numeric_label'].tolist()
        
        X_train, X_test, y_train, y_test = train_test_split(
            texts, labels, test_size=0.2, random_state=42, stratify=labels
        )
        
        return X_train, X_test, y_train, y_test
        
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return None, None, None, None

def create_data_loaders(X_train, X_test, y_train, y_test, tokenizer, batch_size=16, max_length=512):
    """Create PyTorch DataLoaders"""
    print("Creating data loaders...")
    
    train_dataset = NewsDataset(X_train, y_train, tokenizer, max_length)
    test_dataset = NewsDataset(X_test, y_test, tokenizer, max_length)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
    
    return train_loader, test_loader

def train_model(model, train_loader, test_loader, device, epochs=3, learning_rate=2e-5):
    """Train the BERT model"""
    print(f"Starting training for {epochs} epochs...")
    
    # Optimizer and scheduler
    optimizer = AdamW(model.parameters(), lr=learning_rate)
    total_steps = len(train_loader) * epochs
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=0,
        num_training_steps=total_steps
    )
    
    # Training loop
    model.train()
    for epoch in range(epochs):
        print(f"\nEpoch {epoch + 1}/{epochs}")
        total_loss = 0
        
        progress_bar = tqdm(train_loader, desc=f"Training Epoch {epoch + 1}")
        for batch in progress_bar:
            # Move batch to device
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['labels'].to(device)
            
            # Forward pass
            outputs = model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                labels=labels
            )
            
            loss = outputs.loss
            total_loss += loss.item()
            
            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()
            
            progress_bar.set_postfix({'loss': loss.item()})
        
        avg_loss = total_loss / len(train_loader)
        print(f"Average training loss: {avg_loss:.4f}")
        
        # Evaluate after each epoch
        evaluate_model(model, test_loader, device)

def evaluate_model(model, test_loader, device):
    """Evaluate the model"""
    print("Evaluating model...")
    
    model.eval()
    predictions = []
    true_labels = []
    
    with torch.no_grad():
        for batch in tqdm(test_loader, desc="Evaluating"):
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['labels'].to(device)
            
            outputs = model(
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

def save_model(model, tokenizer, save_path='../../../../saved_model'):
    """Save the trained model and tokenizer"""
    print(f"Saving model to {save_path}...")
    
    os.makedirs(save_path, exist_ok=True)
    
    # Save model and tokenizer
    model.save_pretrained(save_path)
    tokenizer.save_pretrained(save_path)
    
    # Save additional info
    model_info = {
        'model_name': 'bert-base-uncased',
        'max_length': 512,
        'trained_on': 'education_news_dataset.csv',
        'dataset_info': 'New education news dataset with title and content columns'
    }
    
    with open(os.path.join(save_path, 'model_info.pkl'), 'wb') as f:
        pickle.dump(model_info, f)
    
    print("Model saved successfully!")

def test_predictions(model, tokenizer, device):
    """Test the trained model with sample predictions"""
    print("\n=== Testing Predictions ===")
    
    test_texts = [
        "The Ministry of Education has launched a new initiative to enhance digital learning across schools with proper funding and infrastructure.",
        "SHOCKING: Government secretly plans to control student minds through mandatory brain chips in all educational institutions!",
        "University researchers publish comprehensive study on climate change impacts in the education sector with peer-reviewed findings.",
        "BREAKING: Secret documents reveal that all exams will be replaced by mind-reading technology next year!"
    ]
    
    model.eval()
    
    for text in test_texts:
        # Tokenize
        encoding = tokenizer(
            text,
            truncation=True,
            padding='max_length',
            max_length=512,
            return_tensors='pt'
        )
        
        # Move to device
        input_ids = encoding['input_ids'].to(device)
        attention_mask = encoding['attention_mask'].to(device)
        
        # Predict
        with torch.no_grad():
            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=1)
            
            predicted_class = torch.argmax(logits, dim=1).item()
            confidence = probabilities[0][predicted_class].item()
        
        label = 'Real' if predicted_class == 1 else 'Fake'
        
        print(f"\nText: {text[:70]}...")
        print(f"Prediction: {label} (Confidence: {confidence:.4f})")

def main():
    """Main training function"""
    print("=== Training Fake News Detector with New Education News Dataset ===\n")
    
    # Set device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Load dataset
    X_train, X_test, y_train, y_test = load_education_news_dataset()
    
    if X_train is None:
        print("Failed to load dataset. Exiting.")
        return
    
    # Initialize tokenizer and model
    print("\nInitializing BERT model...")
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
    model = BertForSequenceClassification.from_pretrained(
        'bert-base-uncased', 
        num_labels=2
    )
    model.to(device)
    
    # Create data loaders
    train_loader, test_loader = create_data_loaders(
        X_train, X_test, y_train, y_test, tokenizer, batch_size=16
    )
    
    # Train model
    train_model(model, train_loader, test_loader, device, epochs=3)
    
    # Save model
    save_model(model, tokenizer)
    
    # Test predictions
    test_predictions(model, tokenizer, device)
    
    print("\n=== Training Complete ===")
    print("✅ Model trained and saved successfully!")
    print("✅ You can now use it in your Django app for real fake news detection.")
    print("✅ The model will automatically be used by your React frontend.")

if __name__ == "__main__":
    main()