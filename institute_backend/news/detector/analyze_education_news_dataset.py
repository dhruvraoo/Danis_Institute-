#!/usr/bin/env python3
"""
Analyze the Education News Dataset
Quick analysis of education_news_dataset.csv
"""

import pandas as pd

def analyze_dataset(csv_path='../../../../education_news_dataset.csv'):
    """Analyze the education news dataset"""
    print("=== Education News Dataset Analysis ===\n")
    
    try:
        # Load the dataset
        df = pd.read_csv(csv_path)
        print(f"📊 Dataset loaded successfully!")
        print(f"📈 Total articles: {len(df)}")
        
        # Basic info
        print(f"\n📋 Dataset Structure:")
        print(f"Columns: {list(df.columns)}")
        print(f"Shape: {df.shape}")
        
        # Label distribution
        print(f"\n🏷️ Label Distribution:")
        label_counts = df['label'].value_counts()
        print(label_counts)
        print(f"Fake news: {label_counts.get('fake', 0)} ({label_counts.get('fake', 0)/len(df)*100:.1f}%)")
        print(f"Real news: {label_counts.get('real', 0)} ({label_counts.get('real', 0)/len(df)*100:.1f}%)")
        
        # Text length analysis
        df['title_length'] = df['title'].str.len()
        df['content_length'] = df['content'].str.len()
        df['combined_length'] = (df['title'] + ' ' + df['content']).str.len()
        
        print(f"\n📏 Text Length Statistics:")
        print(f"Title length - Mean: {df['title_length'].mean():.1f}, Max: {df['title_length'].max()}")
        print(f"Content length - Mean: {df['content_length'].mean():.1f}, Max: {df['content_length'].max()}")
        print(f"Combined length - Mean: {df['combined_length'].mean():.1f}, Max: {df['combined_length'].max()}")
        
        # Sample data
        print(f"\n📝 Sample Real News:")
        real_sample = df[df['label'] == 'real'].iloc[0]
        print(f"Title: {real_sample['title']}")
        print(f"Content: {real_sample['content'][:100]}...")
        
        print(f"\n📝 Sample Fake News:")
        fake_sample = df[df['label'] == 'fake'].iloc[0]
        print(f"Title: {fake_sample['title']}")
        print(f"Content: {fake_sample['content'][:100]}...")
        
        # Check for missing values
        print(f"\n❓ Missing Values:")
        missing = df.isnull().sum()
        print(missing[missing > 0] if missing.sum() > 0 else "No missing values found!")
        
        # Check for duplicates
        duplicates = df.duplicated().sum()
        print(f"\n🔄 Duplicate rows: {duplicates}")
        
        # Unique titles and content
        unique_titles = df['title'].nunique()
        unique_content = df['content'].nunique()
        print(f"\n🎯 Unique Analysis:")
        print(f"Unique titles: {unique_titles}/{len(df)} ({unique_titles/len(df)*100:.1f}%)")
        print(f"Unique content: {unique_content}/{len(df)} ({unique_content/len(df)*100:.1f}%)")
        
        return df
        
    except FileNotFoundError:
        print(f"❌ Error: File '{csv_path}' not found")
        print("Make sure the education_news_dataset.csv file is in the project root directory")
        return None
    except Exception as e:
        print(f"❌ Error analyzing dataset: {e}")
        return None

def main():
    """Main analysis function"""
    df = analyze_dataset()
    
    if df is not None:
        print(f"\n✅ Dataset analysis complete!")
        print(f"📊 Ready for training with {len(df)} articles")
        print(f"🎯 Balanced dataset: {df['label'].value_counts().min()}/{df['label'].value_counts().max()} ratio")
        
        # Training recommendation
        total_articles = len(df)
        if total_articles < 100:
            print(f"⚠️  Small dataset ({total_articles} articles) - consider more data for better results")
        elif total_articles < 1000:
            print(f"✅ Good dataset size ({total_articles} articles) - should train well")
        else:
            print(f"🚀 Large dataset ({total_articles} articles) - excellent for training!")

if __name__ == "__main__":
    main()