#!/usr/bin/env python3
"""
Setup script for Fake News Detector
- Installs required packages
- Downloads sample dataset (if available)
- Tests the integration
"""

import os
import subprocess
import sys

def install_requirements():
    """Install required Python packages"""
    print("Installing required packages...")
    
    packages = [
        'torch',
        'transformers',
        'pandas',
        'numpy',
        'scikit-learn',
        'tqdm'
    ]
    
    for package in packages:
        try:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"✅ {package} installed successfully")
        except subprocess.CalledProcessError:
            print(f"❌ Failed to install {package}")
            return False
    
    return True

def create_sample_dataset():
    """Create a small sample dataset for testing"""
    print("Creating sample dataset for testing...")
    
    import pandas as pd
    
    # Sample fake news data
    fake_data = {
        'title': [
            'BREAKING: Scientists Discover Aliens Living Among Us',
            'Government Hiding Truth About Flat Earth Evidence',
            'Miracle Cure for All Diseases Found in Kitchen Spice',
            'Celebrity Spotted with Three-Headed Baby',
            'Local Man Discovers Time Travel Using Microwave'
        ],
        'text': [
            'In a shocking revelation, scientists at a secret facility have confirmed that aliens have been living among humans for decades. The evidence is overwhelming and the government can no longer hide the truth.',
            'Leaked documents reveal that the government has been suppressing evidence that the Earth is actually flat. NASA photos have been doctored to maintain the spherical Earth conspiracy.',
            'A common kitchen spice has been found to cure cancer, diabetes, and all known diseases. Big pharma companies are trying to suppress this information to protect their profits.',
            'A famous celebrity was photographed holding what appears to be a three-headed baby. Sources close to the family confirm this is the result of secret government experiments.',
            'A local resident claims to have discovered time travel by modifying his microwave oven. He says he has visited the year 3000 and brought back proof.'
        ],
        'subject': ['worldnews'] * 5,
        'date': ['2024-01-01'] * 5
    }
    
    # Sample real news data
    real_data = {
        'title': [
            'New Study Shows Benefits of Regular Exercise',
            'Technology Company Reports Strong Quarterly Earnings',
            'Local School District Receives Education Grant',
            'Weather Service Issues Storm Warning for Region',
            'University Researchers Publish Climate Change Study'
        ],
        'text': [
            'A comprehensive study published in the Journal of Medicine shows that regular exercise can significantly improve cardiovascular health and reduce the risk of chronic diseases.',
            'Tech giant XYZ Corp reported better-than-expected quarterly earnings, with revenue up 15% compared to the same period last year, driven by strong demand for cloud services.',
            'The local school district has been awarded a $2 million federal grant to improve STEM education programs and upgrade laboratory equipment in high schools.',
            'The National Weather Service has issued a severe storm warning for the region, with heavy rain and strong winds expected through the weekend.',
            'Researchers at State University have published a new study on climate change impacts, showing accelerated ice melting in polar regions over the past decade.'
        ],
        'subject': ['worldnews'] * 5,
        'date': ['2024-01-01'] * 5
    }
    
    # Create DataFrames
    fake_df = pd.DataFrame(fake_data)
    real_df = pd.DataFrame(real_data)
    
    # Save to CSV files
    fake_df.to_csv('../../../../Fake.csv', index=False)
    real_df.to_csv('../../../../True.csv', index=False)
    
    print("✅ Sample dataset created (Fake.csv and True.csv)")
    return True

def test_detector():
    """Test the fake news detector"""
    print("Testing fake news detector...")
    
    try:
        from .fake_news_detector import FakeNewsDetector
        
        # Initialize detector
        detector = FakeNewsDetector()
        
        print("✅ Fake news detector setup complete")
        print("\nTo train the model, run the training script from the detector directory")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing detector: {e}")
        return False

def main():
    """Main setup function"""
    print("=== Fake News Detector Setup ===\n")
    
    # Install requirements
    if not install_requirements():
        print("❌ Failed to install requirements")
        return
    
    # Create sample dataset
    if not create_sample_dataset():
        print("❌ Failed to create sample dataset")
        return
    
    # Test detector
    if not test_detector():
        print("❌ Failed to test detector")
        return
    
    print("\n=== Setup Complete ===")
    print("✅ All components installed and tested successfully!")
    print("\nNext steps:")
    print("1. Run training script to train the model")
    print("2. Start your Django server: 'python manage.py runserver'")
    print("3. Test the fake news detection in your React frontend")
    print("\nNote: The sample dataset is small and for testing only.")
    print("For better results, download the full Kaggle dataset:")
    print("https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset")

if __name__ == "__main__":
    main()