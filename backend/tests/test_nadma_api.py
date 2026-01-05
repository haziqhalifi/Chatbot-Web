"""
Test script for NADMA MyDIMS API endpoint
Run this to verify the NADMA disasters endpoint is working correctly
"""
import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def test_nadma_api():
    """Test direct connection to NADMA API"""
    nadma_url = os.getenv("NADMA_API_URL", "https://mydims.nadma.gov.my/api/disasters")
    nadma_token = os.getenv("NADMA_API_TOKEN")
    
    if not nadma_token:
        print("❌ Error: NADMA_API_TOKEN not found in .env file")
        return
    
    print(f"Testing NADMA API...")
    print(f"URL: {nadma_url}")
    print(f"Token: {nadma_token[:20]}...")
    
    headers = {
        "Authorization": f"Bearer {nadma_token}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            print("\n📡 Sending POST request to NADMA API...")
            response = await client.post(
                nadma_url,
                headers=headers,
                json={}
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Success! Received {len(data) if isinstance(data, list) else 1} disaster records")
                
                # Print first record as sample
                if isinstance(data, list) and len(data) > 0:
                    print("\n📋 Sample disaster record:")
                    print(f"{data[0]}")
                elif isinstance(data, dict):
                    print("\n📋 Response data:")
                    print(f"{data}")
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"Response: {response.text}")
                
    except httpx.RequestError as e:
        print(f"❌ Connection Error: {str(e)}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

async def test_local_endpoint():
    """Test the local FastAPI endpoint"""
    print("\n" + "="*60)
    print("Testing Local FastAPI Endpoint")
    print("="*60)
    
    local_url = "http://localhost:8000/map/nadma/disasters"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            print(f"\n📡 Testing GET {local_url}")
            response = await client.get(local_url)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ GET Success!")
                print(f"Records: {data.get('count', 0)}")
            else:
                print(f"❌ GET Error: {response.status_code}")
                print(f"Response: {response.text}")
            
            print(f"\n📡 Testing POST {local_url}")
            response = await client.post(
                local_url,
                json={"limit": 10}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ POST Success!")
                print(f"Records: {data.get('count', 0)}")
            else:
                print(f"❌ POST Error: {response.status_code}")
                
    except httpx.ConnectError:
        print("❌ Could not connect to local server. Make sure backend is running on port 8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("="*60)
    print("NADMA MyDIMS API Test")
    print("="*60)
    
    # Test direct NADMA API
    asyncio.run(test_nadma_api())
    
    # Test local endpoint
    asyncio.run(test_local_endpoint())
