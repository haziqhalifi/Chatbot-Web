"""
Quick test script for the Map Data API endpoints
Run this after starting the backend server
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_get_all_endpoints():
    """Test GET /map/endpoints"""
    print("Testing GET /map/endpoints...")
    response = requests.get(f"{BASE_URL}/map/endpoints")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Found {len(data['endpoints'])} endpoints:")
        for endpoint in data['endpoints']:
            print(f"  - {endpoint['name']} ({endpoint['type']})")
        print("✓ Test passed\n")
    else:
        print(f"✗ Test failed: {response.text}\n")

def test_get_endpoint_by_type():
    """Test GET /map/endpoints/{type}"""
    print("Testing GET /map/endpoints/{type}...")
    types = ["landslide", "flood", "poi", "population"]
    
    for endpoint_type in types:
        response = requests.get(f"{BASE_URL}/map/endpoints/{endpoint_type}")
        if response.status_code == 200:
            data = response.json()
            print(f"  ✓ {endpoint_type}: {data['name']}")
        else:
            print(f"  ✗ {endpoint_type}: Failed with status {response.status_code}")
    print()

def test_get_types():
    """Test GET /map/types"""
    print("Testing GET /map/types...")
    response = requests.get(f"{BASE_URL}/map/types")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Available types: {', '.join(data['types'])}")
        print("✓ Test passed\n")
    else:
        print(f"✗ Test failed: {response.text}\n")

def test_invalid_type():
    """Test GET /map/endpoints/{type} with invalid type"""
    print("Testing GET /map/endpoints/invalid...")
    response = requests.get(f"{BASE_URL}/map/endpoints/invalid")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 404:
        print(f"✓ Correctly returned 404 for invalid type")
        print(f"  Error message: {response.json()['detail']}\n")
    else:
        print(f"✗ Expected 404, got {response.status_code}\n")

def test_arcgis_urls():
    """Test that ArcGIS URLs are accessible"""
    print("Testing ArcGIS Feature Server URLs...")
    response = requests.get(f"{BASE_URL}/map/endpoints")
    if response.status_code == 200:
        data = response.json()
        for endpoint in data['endpoints']:
            # Test if the ArcGIS URL is accessible (query for metadata)
            arcgis_url = f"{endpoint['url']}?f=json"
            try:
                arcgis_response = requests.get(arcgis_url, timeout=5)
                if arcgis_response.status_code == 200:
                    print(f"  ✓ {endpoint['name']}: URL is accessible")
                else:
                    print(f"  ✗ {endpoint['name']}: URL returned {arcgis_response.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"  ✗ {endpoint['name']}: Connection error - {str(e)}")
    print()

if __name__ == "__main__":
    print("=" * 60)
    print("Map Data API Test Suite")
    print("=" * 60)
    print()
    
    try:
        # Test basic API health
        print("Checking backend server...")
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✓ Backend server is running\n")
        else:
            print("✗ Backend server health check failed\n")
    except requests.exceptions.RequestException:
        print("✗ Cannot connect to backend server!")
        print("Make sure the server is running at http://localhost:8000")
        print("Run: .\\env\\Scripts\\uvicorn.exe backend.main:app --reload")
        exit(1)
    
    # Run all tests
    test_get_all_endpoints()
    test_get_endpoint_by_type()
    test_get_types()
    test_invalid_type()
    test_arcgis_urls()
    
    print("=" * 60)
    print("All tests completed!")
    print("=" * 60)
