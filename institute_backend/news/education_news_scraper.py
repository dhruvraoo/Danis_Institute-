import requests
from bs4 import BeautifulSoup
import feedparser
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

logger = logging.getLogger(__name__)

import random

# Different educational images for variety
EDUCATION_IMAGES = [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&h=200&fit=crop&crop=entropy&auto=format&q=60',  # University building
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=entropy&auto=format&q=60',  # Classroom
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop&crop=entropy&auto=format&q=60',  # Library
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop&crop=entropy&auto=format&q=60',  # Students studying
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop&crop=entropy&auto=format&q=60',  # Digital learning
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop&crop=entropy&auto=format&q=60',  # Technology in education
]

# Source-specific images for Indian news sources
INDIAN_EDUCATION_IMAGES = [
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&h=200&fit=crop&crop=entropy&auto=format&q=60',  # Indian students
    'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=300&h=200&fit=crop&crop=entropy&auto=format&q=60',  # Books and learning
    'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=300&h=200&fit=crop&crop=entropy&auto=format&q=60',  # Graduation
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&crop=entropy&auto=format&q=60',  # School building
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop&crop=entropy&auto=format&q=60',  # Students discussion
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop&crop=entropy&auto=format&q=60',  # Education concept
]

def get_random_education_image():
    return random.choice(EDUCATION_IMAGES)

def get_indian_education_image():
    return random.choice(INDIAN_EDUCATION_IMAGES)

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0'
]

def get_random_headers():
    return {
        'User-Agent': random.choice(USER_AGENTS),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }

# ✅ Sources that allow scraping (or provide RSS)
SOURCES = [
    {
        "name": "Edutopia",
        "url": "https://www.edutopia.org",
        "selector": "h3 a, h2 a, .card-title a, .article-title a",
        "img_selector": ".card-image img, .article-image img, img",
        "rss": None,
        "priority": 1,
        "alternate_urls": [
            "https://www.edutopia.org/articles",
            "https://www.edutopia.org/topic/teaching-strategies",
            "https://www.edutopia.org/topic/classroom-management"
        ]
    },
    {
        "name": "Times Higher Education",
        "url": "https://www.timeshighereducation.com/news",
        "selector": "a[href*='/news/'], a[href*='/features/'], h3 a, h2 a",
        "img_selector": ".teaser__image img, .article-image img, .news-image img, img[src*='timeshighereducation'], img",
        "rss": None,
        "priority": 1,
        "alternate_urls": [
            "https://www.timeshighereducation.com/features",
            "https://www.timeshighereducation.com/news/policy"
        ]
    },
    {
        "name": "The Hindu",
        "url": "https://www.thehindu.com/education/",
        "selector": "h3 a, .story-card h3 a, .story-card-news h3 a, .title a, .story-card-news .title a",
        "img_selector": "figure img, .story-card-news img, .story-card img, .lead-img img, .picture img, .article-image img, img[src*='thehindu'][src*='jpg'], img[src*='thehindu'][src*='png'], img[src*='thehindu'][src*='jpeg']",
        "rss": "https://www.thehindu.com/education/feeder/default.rss",
        "priority": 2
    },
    {
        "name": "India Today",
        "url": "https://www.indiatoday.in/education-today",
        "selector": "div.detail a, .story-kicker a, h2 a",
        "img_selector": "div.detail img, .story-image img, img",
        "rss": None,
        "priority": 2,
        "alternate_urls": [
            "https://www.indiatoday.in/education-today/latest-updates",
            "https://www.indiatoday.in/education-today/news"
        ]
    },
    {
        "name": "Indian Express",
        "url": "https://indianexpress.com/section/education/",
        "selector": "div.articles h2 a, .title a, h3 a",
        "img_selector": ".articles img[src*='indianexpress'][src*='uploads'], .featured-image img, .story-image img, img[src*='indianexpress'][src*='jpg'], img[src*='indianexpress'][src*='png']",
        "rss": None,
        "priority": 2
    },

]

def fetch_with_beautifulsoup(source):
    try:
        resp = requests.get(source["url"], headers=get_random_headers(), timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.content, 'lxml')
        
        # Try multiple selectors for better compatibility
        articles = []
        for selector in source["selector"].split(", "):
            found_articles = soup.select(selector.strip())
            if found_articles:
                articles = found_articles[:6]  # Get more articles
                break
        
        # Try multiple image selectors
        images = []
        if source.get("img_selector"):
            for img_selector in source["img_selector"].split(", "):
                found_images = soup.select(img_selector.strip())
                if found_images:
                    images = found_images[:6]
                    break
        
        results = []
        for i, a in enumerate(articles):
            title = a.get_text(strip=True)
            if len(title) < 10:  # Skip very short titles
                continue
                
            link = a.get('href', '')
            if not link:
                continue
                
            # Handle relative URLs
            if not link.startswith("http"):
                base_url = source["url"].split('/')[0] + '//' + source["url"].split('/')[2]
                if link.startswith('/'):
                    link = base_url + link
                else:
                    link = base_url + '/' + link
            
            # Get image with multiple fallback strategies and debug logging
            image = None
            base_url = source["url"].split('/')[0] + '//' + source["url"].split('/')[2]
            logger.info(f"Processing article {i+1}: {title[:50]}...")
            
            # Strategy 1: Try to find image near the article link
            if i < len(images):
                img_elem = images[i]
                logger.info(f"Found {len(images)} images for article {i+1}")
                
                for attr in ['src', 'data-src', 'data-lazy-src', 'data-original']:
                    if img_elem.has_attr(attr):
                        img_src = img_elem[attr].strip()
                        logger.info(f"Checking image attribute {attr}: {img_src[:100]}")
                        
                        # Skip unwanted images
                        skip_keywords = [
                            'logo', 'spacer', '1x1', 'default', 'placeholder', 
                            'scorecardresearch', 'tracking', 'pixel', 'blank',
                            'avatar', 'profile', 'icon', 'sprite'
                        ]
                        
                        if any(skip in img_src.lower() for skip in skip_keywords):
                            logger.info(f"Skipping unwanted image: {img_src[:50]}")
                            continue
                        
                        # Process and validate image URL
                        if img_src.startswith('http'):
                            image = img_src
                            logger.info(f"Found absolute image URL: {image[:80]}")
                            break
                        elif img_src.startswith('/'):
                            image = base_url + img_src
                            logger.info(f"Converted relative URL to absolute: {image[:80]}")
                            break
                        elif img_src.startswith('//'):
                            image = 'https:' + img_src
                            logger.info(f"Added protocol to protocol-relative URL: {image[:80]}")
                            break
            
            # Strategy 2: Try to find image in the article's parent container
            if not image:
                try:
                    logger.info(f"Strategy 2: Searching in parent container for article {i+1}")
                    parent = a.find_parent()
                    if parent:
                        # Look for images in various containers
                        nearby_imgs = parent.find_all('img')
                        logger.info(f"Found {len(nearby_imgs)} images in parent container")
                        
                        for nearby_img in nearby_imgs:
                            for attr in ['src', 'data-src', 'data-lazy-src', 'data-original']:
                                if nearby_img.has_attr(attr):
                                    img_src = nearby_img[attr].strip()
                                    logger.info(f"Parent container image {attr}: {img_src[:100]}")
                                    
                                    # Skip unwanted images
                                    skip_keywords = [
                                        'logo', 'spacer', '1x1', 'default', 'placeholder', 
                                        'scorecardresearch', 'tracking', 'pixel', 'blank',
                                        'avatar', 'profile', 'icon', 'sprite'
                                    ]
                                    
                                    if any(skip in img_src.lower() for skip in skip_keywords):
                                        logger.info(f"Skipping unwanted parent image: {img_src[:50]}")
                                        continue
                                        
                                    # Process and validate image URL
                                    if img_src.startswith('http'):
                                        image = img_src
                                        logger.info(f"Found absolute parent image URL: {image[:80]}")
                                        break
                                    elif img_src.startswith('/'):
                                        image = base_url + img_src
                                        logger.info(f"Converted relative parent URL: {image[:80]}")
                                        break
                                    elif img_src.startswith('//'):
                                        image = 'https:' + img_src
                                        logger.info(f"Added protocol to parent URL: {image[:80]}")
                                        break
                            
                            if image:
                                break
                except Exception as e:
                    logger.warning(f"Error in Strategy 2 for article {i+1}: {e}")
            
            # Strategy 3: Use source-specific fallback images
            if not image:
                if source['name'] in ['The Hindu', 'India Today', 'Indian Express', 'Times Express']:
                    image = get_indian_education_image()
                    logger.info(f"Using Indian education fallback image for {source['name']}")
                else:
                    image = get_random_education_image()
                    logger.info(f"Using general education fallback image for {source['name']}")
            
            # Final validation of image URL
            if image:
                # Ensure the image URL is properly formatted
                if not image.startswith('http'):
                    if image.startswith('//'):
                        image = 'https:' + image
                    elif image.startswith('/'):
                        image = base_url + image
                    else:
                        logger.warning(f"Invalid image URL format: {image}")
                        image = get_indian_education_image() if source['name'] in ['The Hindu', 'India Today', 'Indian Express', 'Times Express'] else get_random_education_image()
                
                logger.info(f"Final image URL for article {i+1}: {image}")
            else:
                logger.warning(f"No image found for article {i+1}, using fallback")
                image = get_indian_education_image() if source['name'] in ['The Hindu', 'India Today', 'Indian Express', 'Times Express'] else get_random_education_image()
            
            # Get description (try to find summary or use title)
            description = title
            try:
                # Look for description in nearby elements
                parent = a.find_parent()
                if parent:
                    desc_elem = parent.find(['p', 'div'], class_=['summary', 'description', 'excerpt', 'teaser'])
                    if desc_elem:
                        description = desc_elem.get_text(strip=True)[:200]
            except:
                pass
            
            results.append({
                "title": title[:150],  # Limit title length
                "url": link,
                "image": image,
                "description": description[:300]  # Limit description length
            })
            
            if len(results) >= 10:  # Get more articles for variety
                break
                
        return results
    except Exception as e:
        logger.warning(f"BeautifulSoup failed for {source['name']}: {e}")
        return []

def fetch_with_rss(source):
    try:
        if not source["rss"]:
            return []
        feed = feedparser.parse(source["rss"])
        results = []
        for entry in feed.entries[:4]:
            # Try to extract image from RSS entry
            image = None
            
            # Check for media content
            if hasattr(entry, 'media_content') and entry.media_content:
                image = entry.media_content[0]['url']
            elif hasattr(entry, 'media_thumbnail') and entry.media_thumbnail:
                image = entry.media_thumbnail[0]['url']
            elif hasattr(entry, 'enclosures') and entry.enclosures:
                for enclosure in entry.enclosures:
                    if enclosure.type.startswith('image/'):
                        image = enclosure.href
                        break
            
            # Fallback to source-specific images
            if not image:
                if source['name'] in ['The Hindu', 'India Today', 'Indian Express']:
                    image = get_indian_education_image()
                else:
                    image = get_random_education_image()
            
            results.append({
                "title": entry.title,
                "url": entry.link,
                "image": image,
                "description": getattr(entry, 'summary', entry.title)
            })
        return results
    except Exception as e:
        logger.warning(f"RSS failed for {source['name']}: {e}")
        return []

def fetch_with_selenium(source):
    try:
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        driver = webdriver.Chrome(options=options)
        driver.get(source["url"])
        time.sleep(3)  # wait for JS content
        html = driver.page_source
        driver.quit()
        
        soup = BeautifulSoup(html, 'lxml')
        articles = soup.select(source["selector"])[:4]
        images = soup.select(source.get("img_selector", ""))[:4] if source.get("img_selector") else []
        
        results = []
        for i, a in enumerate(articles):
            title = a.get_text(strip=True)
            link = a['href']
            if not link.startswith("http"):
                link = source["url"].rstrip("/") + "/" + link.lstrip("/")
            image = images[i]['src'] if i < len(images) and images[i].has_attr('src') else 'https://via.placeholder.com/300x200?text=Education+News'
            results.append({
                "title": title,
                "url": link,
                "image": image,
                "description": title
            })
        return results
    except Exception as e:
        logger.warning(f"Selenium failed for {source['name']}: {e}")
        return []

def fetch_education_news():
    all_news = []
    
    # Ensure balanced scraping by processing all sources
    sorted_sources = SOURCES  # Process all sources

    for source in sorted_sources:
        logger.info(f"Fetching news from {source['name']}")
        
        # Add small delay between requests to avoid rate limiting
        if all_news:  # Only delay if we've already made requests
            time.sleep(random.uniform(0.5, 1.5))
        
        # Randomly select URL for variety (if alternate URLs available)
        original_url = source["url"]
        if source.get("alternate_urls"):
            all_urls = [source["url"]] + source["alternate_urls"]
            source["url"] = random.choice(all_urls)
            logger.info(f"Using URL: {source['url']}")
        
        # Try BeautifulSoup first
        news = fetch_with_beautifulsoup(source)
        
        # Restore original URL
        source["url"] = original_url
        
        # Fallback to RSS if available and BeautifulSoup failed
        if not news and source.get("rss"):
            logger.info(f"Trying RSS for {source['name']}")
            news = fetch_with_rss(source)
        
        # For The Hindu, try RSS first if BeautifulSoup gives few results
        if source['name'] == 'The Hindu' and len(news) < 3 and source.get("rss"):
            logger.info(f"Trying RSS for better results from {source['name']}")
            rss_news = fetch_with_rss(source)
            if len(rss_news) > len(news):
                news = rss_news
        
        # Fallback to Selenium for JavaScript-heavy sites (use sparingly)
        if not news and source['name'] in ['Times Higher Education']:
            logger.info(f"Trying Selenium for {source['name']}")
            news = fetch_with_selenium(source)
        
        if news:
            logger.info(f"Successfully fetched {len(news)} articles from {source['name']}")
            # Log image URLs for debugging
            for idx, article in enumerate(news[:3]):  # Log first 3 articles
                logger.info(f"{source['name']} Article {idx+1}: {article['title'][:50]} | Image: {article['image'][:80]}")
            
            # Limit articles per source to ensure variety
            max_per_source = 8 if source.get('priority', 2) == 1 else 10  # 8 for international, 10 for Indian
            all_news.extend(news[:max_per_source])
        else:
            logger.warning(f"No articles fetched from {source['name']}")

    # Remove duplicates based on URL and title similarity
    seen_urls = set()
    seen_titles = set()
    unique_news = []
    
    for article in all_news:
        url = article['url']
        title_words = set(article['title'].lower().split())
        
        # Check for URL duplicates
        if url in seen_urls:
            continue
            
        # Check for exact title duplicates
        if article['title'] in seen_titles:
            continue
            
        # Check for similar titles (if more than 80% words match)
        is_similar = False
        for seen_title in seen_titles:
            seen_words = set(seen_title.lower().split())
            if len(title_words) > 0 and len(seen_words) > 0:
                similarity = len(title_words & seen_words) / max(len(title_words), len(seen_words))
                if similarity > 0.8:
                    is_similar = True
                    break
        
        if not is_similar:
            unique_news.append(article)
            seen_urls.add(url)
            seen_titles.add(article['title'])

    # Balance international vs Indian sources (50-50 split)
    international_news = []
    indian_news = []
    
    for article in unique_news:
        domain = article['url'].split('/')[2] if '/' in article['url'] else ''
        if 'edutopia' in domain or 'timeshighereducation' in domain:
            international_news.append(article)
        elif 'thehindu' in domain or 'indiatoday' in domain or 'indianexpress' in domain or 'timesexpress' in domain:
            indian_news.append(article)
    
    logger.info(f"Found {len(international_news)} international and {len(indian_news)} Indian articles")
    
    # Shuffle articles for variety on each refresh
    random.shuffle(international_news)
    random.shuffle(indian_news)
    
    # Ensure strict 50-50 balance: 6 international + 6 Indian = 12 total
    final_news = []
    
    # Always take exactly 6 from each category if available
    international_count = min(6, len(international_news))
    indian_count = min(6, len(indian_news))
    
    final_news.extend(international_news[:international_count])
    final_news.extend(indian_news[:indian_count])
    
    # If one category has fewer than 6, fill remaining slots with the other
    total_needed = 12
    current_total = len(final_news)
    
    if current_total < total_needed:
        remaining_slots = total_needed - current_total
        if international_count < 6 and len(indian_news) > indian_count:
            # Need more international but have more Indian
            additional_indian = min(remaining_slots, len(indian_news) - indian_count)
            final_news.extend(indian_news[indian_count:indian_count + additional_indian])
        elif indian_count < 6 and len(international_news) > international_count:
            # Need more Indian but have more international
            additional_international = min(remaining_slots, len(international_news) - international_count)
            final_news.extend(international_news[international_count:international_count + additional_international])
    
    # Final shuffle for variety in display order
    random.shuffle(final_news)
    
    logger.info(f"Final news distribution: {len([n for n in final_news if 'edutopia' in n['url'] or 'timeshighereducation' in n['url']])} international, {len([n for n in final_news if 'thehindu' in n['url'] or 'indiatoday' in n['url'] or 'indianexpress' in n['url'] or 'timesexpress' in n['url']])} Indian")
    
    # Log final article details for debugging
    for idx, article in enumerate(final_news):
        source_type = "International" if ('edutopia' in article['url'] or 'timeshighereducation' in article['url']) else "Indian"
        logger.info(f"Final Article {idx+1} ({source_type}): {article['title'][:40]} | Image: {article['image'][:60]}")
    
    return final_news[:12]  # Return up to 12 articles with balanced sources

def get_educational_news():
    """
    Main function to get educational news with fallback support
    """
    try:
        news = fetch_education_news()
        if news and len(news) > 0:
            return news
        else:
            logger.warning("No news articles scraped, using fallback data")
            from .fallback_data import get_fallback_educational_news
            return get_fallback_educational_news()[:12]
    except Exception as e:
        logger.error(f"Error in get_educational_news: {e}")
        from .fallback_data import get_fallback_educational_news
        return get_fallback_educational_news()[:12]

# ✅ For Django Template Usage (4x2 grid):
# In your view: context['education_news'] = get_educational_news()
# In your template:
# {% for news in education_news %}
#   <div class="news-card">
#       <img src="{{ news.image }}" alt="{{ news.title }}">
#       <h3><a href="{{ news.url }}" target="_blank">{{ news.title }}</a></h3>
#       <p>{{ news.description }}</p>
#   </div>
# {% endfor %}

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    news_list = get_educational_news()
    for i, n in enumerate(news_list, start=1):
        print(f"{i}. {n['title']} -> {n['url']}")
