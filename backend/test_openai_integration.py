"""
Test script for OpenAI Assistant Integration
Run this after setup to verify everything works
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from backend/.env
backend_dir = Path(__file__).parent
env_path = backend_dir / '.env'
load_dotenv(dotenv_path=env_path)

# Debug: Print what was loaded
print(f"Loading .env from: {env_path}")
print(f"OPENAI_API_KEY exists: {bool(os.getenv('OPENAI_API_KEY'))}")
print(f"OPENAI_ASSISTANT_ID exists: {bool(os.getenv('OPENAI_ASSISTANT_ID'))}")
print()

def test_configuration():
    """Test if configuration is properly set"""
    print("=" * 60)
    print("Testing Configuration...")
    print("=" * 60)
    
    api_key = os.getenv("OPENAI_API_KEY")
    assistant_id = os.getenv("OPENAI_ASSISTANT_ID")
    
    if not api_key:
        print("❌ OPENAI_API_KEY not found in .env")
        return False
    
    if not assistant_id:
        print("❌ OPENAI_ASSISTANT_ID not found in .env")
        return False
    
    print(f"✓ OPENAI_API_KEY: {api_key[:20]}...{api_key[-10:]}")
    print(f"✓ OPENAI_ASSISTANT_ID: {assistant_id}")
    print()
    return True

def test_openai_service():
    """Test OpenAI service initialization and basic functionality"""
    print("=" * 60)
    print("Testing OpenAI Service...")
    print("=" * 60)
    
    try:
        from services.openai_assistant_service import get_openai_assistant_service
        
        print("Attempting to initialize OpenAI service...")
        service = get_openai_assistant_service()
        print("✓ OpenAI Assistant Service initialized")
        
        # Test thread creation
        print("Creating test thread...")
        thread_id = service.create_thread()
        print(f"✓ Created test thread: {thread_id}")
        
        # Test message sending
        print("\nSending test message...")
        response = service.send_message(
            thread_id=thread_id,
            message="Hello! Please respond with 'Test successful' if you receive this."
        )
        
        print(f"✓ Received response: {response['response'][:100]}...")
        print(f"✓ Response time: {response['duration']:.2f}s")
        print()
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("   Make sure OpenAI package is installed: pip install --upgrade openai")
        import traceback
        traceback.print_exc()
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_database_schema():
    """Test if database schema has been updated"""
    print("=" * 60)
    print("Testing Database Schema...")
    print("=" * 60)
    
    try:
        from database.connection import DatabaseConnection
        
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # Check for ai_provider column
            cursor.execute("""
                SELECT COUNT(*) FROM sys.columns 
                WHERE object_id = OBJECT_ID('chat_sessions') 
                AND name = 'ai_provider'
            """)
            has_ai_provider = cursor.fetchone()[0] > 0
            
            # Check for metadata column
            cursor.execute("""
                SELECT COUNT(*) FROM sys.columns 
                WHERE object_id = OBJECT_ID('chat_sessions') 
                AND name = 'metadata'
            """)
            has_metadata = cursor.fetchone()[0] > 0
            
            cursor.close()
            
            if has_ai_provider:
                print("✓ ai_provider column exists")
            else:
                print("❌ ai_provider column missing")
                
            if has_metadata:
                print("✓ metadata column exists")
            else:
                print("❌ metadata column missing")
            
            print()
            return has_ai_provider and has_metadata
            
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def test_chat_service():
    """Test chat service provider routing"""
    print("=" * 60)
    print("Testing Chat Service Provider Routing...")
    print("=" * 60)
    
    try:
        from config.settings import AI_PROVIDERS, DEFAULT_AI_PROVIDER
        
        print(f"✓ Available providers: {AI_PROVIDERS}")
        print(f"✓ Default provider: {DEFAULT_AI_PROVIDER}")
        print()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all tests"""
    print("\n")
    print("*" * 60)
    print("OpenAI Assistant Integration Test Suite")
    print("*" * 60)
    print()
    
    results = []
    
    # Run tests
    results.append(("Configuration", test_configuration()))
    results.append(("Database Schema", test_database_schema()))
    results.append(("Chat Service", test_chat_service()))
    results.append(("OpenAI Service", test_openai_service()))
    
    # Print summary
    print("=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for test_name, result in results:
        status = "✓ PASSED" if result else "❌ FAILED"
        print(f"{test_name:.<30} {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print()
    print(f"Total: {passed} passed, {failed} failed")
    print()
    
    if failed == 0:
        print("🎉 All tests passed! Your OpenAI integration is ready to use.")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
    
    print()

if __name__ == "__main__":
    # Add backend directory to path
    backend_path = os.path.dirname(os.path.abspath(__file__))
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)
    
    main()
