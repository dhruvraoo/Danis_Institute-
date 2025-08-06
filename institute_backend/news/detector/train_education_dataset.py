#!/usr/bin/env python3
"""
Train Fake News Detector with the Education Dataset
Specifically designed for fake_news_education_dataset.csv
"""

from .fake_news_detector import FakeNewsDetector
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

def train_education_dataset(csv_path='../../../fake_news_education_dataset.csv'):
    """Train the model with the education dataset"""
    print("=== Training Fake News Detector with Education Dataset ===\n")
    
    # Initialize detector
    detector = FakeNewsDetector()
    
    # Load custom CSV data
    X_train, X_test, y_train, y_test = detector.load_custom_csv(
        csv_path, 'text', 'label', 'title'
    )
    
    if X_train is None:
        print("Failed to load data. Please check your CSV file.")
        return None
    
    # Create data loaders
    train_loader, test_loader = detector.create_data_loaders(
        X_train, X_test, y_train, y_test, batch_size=16
    )
    
    # Train model
    detector.train_model(train_loader, test_loader, epochs=3)
    
    # Save model
    detector.save_model('../../../saved_model')
    
    print("\n=== Training Complete ===")
    print("Model saved to ../../../saved_model/")
    
    return detector

if __name__ == "__main__":
    train_education_dataset()