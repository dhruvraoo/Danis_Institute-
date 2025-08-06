#!/usr/bin/env python3
"""
Train Fake News Detector with Custom CSV File
Usage: python train_with_csv.py your_file.csv
"""

import sys
import os
from .fake_news_detector import train_with_custom_csv, FakeNewsDetector

def main():
    if len(sys.argv) < 2:
        print("Usage: python train_with_csv.py <csv_file_path>")
        print("\nExample:")
        print("python train_with_csv.py news_data.csv")
        print("\nYour CSV should have columns like:")
        print("- text: The news article content")
        print("- label: 0 for fake, 1 for real (or 'fake'/'real')")
        print("- title: Optional title column")
        return
    
    csv_path = sys.argv[1]
    
    if not os.path.exists(csv_path):
        print(f"Error: File '{csv_path}' not found")
        return
    
    print(f"Training with CSV file: {csv_path}")
    print("=" * 50)
    
    # Ask user for column names
    print("\nPlease specify your CSV column names:")
    text_col = input("Text column name (default: 'text'): ").strip() or 'text'
    label_col = input("Label column name (default: 'label'): ").strip() or 'label'
    title_col = input("Title column name (optional, press Enter to skip): ").strip() or None
    
    epochs = input("Number of training epochs (default: 3): ").strip()
    epochs = int(epochs) if epochs.isdigit() else 3
    
    print(f"\nConfiguration:")
    print(f"- CSV file: {csv_path}")
    print(f"- Text column: {text_col}")
    print(f"- Label column: {label_col}")
    print(f"- Title column: {title_col or 'None'}")
    print(f"- Epochs: {epochs}")
    
    confirm = input("\nProceed with training? (y/n): ").strip().lower()
    if confirm != 'y':
        print("Training cancelled.")
        return
    
    # Start training
    detector = train_with_custom_csv(
        csv_path=csv_path,
        text_column=text_col,
        label_column=label_col,
        title_column=title_col,
        epochs=epochs
    )
    
    if detector:
        # Test the trained model
        print("\n=== Testing Trained Model ===")
        test_texts = [
            "Breaking news: Scientists discover amazing breakthrough in technology",
            "SHOCKING: This weird trick will change your life forever, doctors hate it!",
            "Local government announces new infrastructure development project",
            "You won't believe what happened next in this incredible story"
        ]
        
        for text in test_texts:
            label, confidence = detector.predict(text)
            print(f"\nText: {text[:60]}...")
            print(f"Prediction: {label} (Confidence: {confidence:.4f})")
        
        print(f"\nModel successfully trained and saved!")
        print("You can now use it in your Django app for fake news detection.")

if __name__ == "__main__":
    main()