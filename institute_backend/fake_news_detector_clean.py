#!/usr/bin/env python3
"""
Clean Fake News Detector for Django Integration
"""

import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from transformers import (
    BertTokenizer, 
    BertForSequenceClassification
)
import os
import warnings
import pickle

warnings.filterwarnings('ignore')

class FakeNewsDetector:
    """Fake News Detection System"""
    
    def __init__(self, model_name='bert-base-uncased', max_length=512):
        self.model_name = model_name
        self.max_length = max_length
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Initialize tokenizer and model
        self.tokenizer = BertTokenizer.from_pretrained(model_name)
        self.model = BertForSequenceClassification.from_pretrained(
            model_name, 
            num_labels=2
        )
        self.model.to(self.device)
    
    def load_model(self, load_path='./saved_model'):
        """Load a saved model"""
        try:
            # Load tokenizer and model
            self.tokenizer = BertTokenizer.from_pretrained(load_path)
            self.model = BertForSequenceClassification.from_pretrained(load_path)
            self.model.to(self.device)
            
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