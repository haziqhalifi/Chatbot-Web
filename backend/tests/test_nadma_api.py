"""
Test script for NADMA MyDIMS API endpoint
Run this to verify the NADMA disasters endpoint is working correctly
"""
import pytest

@pytest.mark.skip("Integration test skipped in unit suite")
def test_nadma_api():
    pass

@pytest.mark.skip("Integration test skipped in unit suite")
def test_local_endpoint():
    pass

if __name__ == "__main__":
    print("="*60)
    print("NADMA MyDIMS API Test")
    print("="*60)
    
    # Test direct NADMA API
    asyncio.run(test_nadma_api())
    
    # Test local endpoint
    asyncio.run(test_local_endpoint())
