import requests
import json

# Base URL
BASE_URL = 'http://127.0.0.1:8000'

# Admin login
def admin_login():
    print("\n=== Testing Admin Login ===")
    login_url = f"{BASE_URL}/accounts/api/admin-login/"
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    response = requests.post(login_url, json=login_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200 and response.json().get('success'):
        print("✅ Admin login successful")
        return response.cookies
    else:
        print("❌ Admin login failed")
        return None

# Test admin classes endpoint
def test_admin_classes(cookies):
    print("\n=== Testing Admin Classes API ===")
    classes_url = f"{BASE_URL}/accounts/api/admin/classes/"
    
    response = requests.get(classes_url, cookies=cookies)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:200]}..." if len(response.text) > 200 else f"Response: {response.text}")
    
    if response.status_code == 200 and response.json().get('success'):
        print(f"✅ Classes API successful - Found {len(response.json().get('classes', []))} classes")
    else:
        print("❌ Classes API failed")

# Test admin subjects endpoint
def test_admin_subjects(cookies):
    print("\n=== Testing Admin Subjects API ===")
    subjects_url = f"{BASE_URL}/accounts/api/admin/subjects/"
    
    response = requests.get(subjects_url, cookies=cookies)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:200]}..." if len(response.text) > 200 else f"Response: {response.text}")
    
    if response.status_code == 200 and response.json().get('success'):
        print(f"✅ Subjects API successful - Found {len(response.json().get('subjects', []))} subjects")
    else:
        print("❌ Subjects API failed")

# Main test function
def run_tests():
    print("Starting API tests...")
    
    # Login and get cookies
    cookies = admin_login()
    
    if cookies:
        # Test admin endpoints
        test_admin_classes(cookies)
        test_admin_subjects(cookies)
    else:
        print("Skipping API tests due to login failure")

if __name__ == "__main__":
    run_tests()