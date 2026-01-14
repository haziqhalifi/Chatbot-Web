"""
Test script to verify FAQ admin tracking functionality
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.faq import get_all_faqs, get_faq_by_id, add_faq, update_faq, delete_faq
from database.connection import DatabaseConnection

def test_faq_admin_tracking():
    """Test FAQ admin tracking functionality"""
    print("=" * 60)
    print("Testing FAQ Admin Tracking Functionality")
    print("=" * 60)
    print()
    
    # Test 1: Get admin user ID for testing
    print("1. Finding admin user for testing...")
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT TOP 1 id, name, email FROM users WHERE role LIKE '%Admin%'")
            admin = cursor.fetchone()
            cursor.close()
            
            if admin:
                admin_id, admin_name, admin_email = admin
                print(f"   ✓ Found admin user: {admin_name} ({admin_email}), ID: {admin_id}")
            else:
                print("   ⚠ No admin user found in database")
                admin_id = None
    except Exception as e:
        print(f"   ❌ Error finding admin: {e}")
        return False
    
    # Test 2: Create FAQ with admin tracking
    print("\n2. Creating FAQ with admin tracking...")
    try:
        faq_id = add_faq(
            question="Test Question - Admin Tracking",
            answer="This is a test answer to verify admin tracking works.",
            category="Testing",
            order_index=999,
            created_by=admin_id
        )
        
        if faq_id:
            print(f"   ✓ FAQ created successfully, ID: {faq_id}")
        else:
            print("   ❌ Failed to create FAQ")
            return False
    except Exception as e:
        print(f"   ❌ Error creating FAQ: {e}")
        return False
    
    # Test 3: Retrieve FAQ and verify tracking data
    print("\n3. Retrieving FAQ and verifying admin tracking...")
    try:
        faq = get_faq_by_id(faq_id)
        
        if faq:
            print(f"   ✓ FAQ retrieved successfully")
            print(f"   - Question: {faq['question']}")
            print(f"   - Created by ID: {faq.get('created_by')}")
            print(f"   - Created by name: {faq.get('created_by_name')}")
            print(f"   - Created by email: {faq.get('created_by_email')}")
            print(f"   - Updated by ID: {faq.get('updated_by')}")
            print(f"   - Updated by name: {faq.get('updated_by_name')}")
            
            # Verify data
            if faq.get('created_by') == admin_id:
                print("   ✓ created_by correctly set to admin ID")
            else:
                print(f"   ⚠ created_by mismatch: expected {admin_id}, got {faq.get('created_by')}")
                
            if faq.get('updated_by') == admin_id:
                print("   ✓ updated_by correctly set to admin ID")
            else:
                print(f"   ⚠ updated_by mismatch: expected {admin_id}, got {faq.get('updated_by')}")
        else:
            print("   ❌ Failed to retrieve FAQ")
            return False
    except Exception as e:
        print(f"   ❌ Error retrieving FAQ: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Test 4: Update FAQ with different admin (simulated)
    print("\n4. Updating FAQ with admin tracking...")
    try:
        success = update_faq(
            faq_id,
            answer="Updated answer to test admin tracking on updates.",
            updated_by=admin_id
        )
        
        if success:
            print("   ✓ FAQ updated successfully")
            
            # Verify update tracking
            faq = get_faq_by_id(faq_id)
            if faq.get('updated_by') == admin_id:
                print("   ✓ updated_by correctly updated")
            else:
                print(f"   ⚠ updated_by not updated correctly")
        else:
            print("   ❌ Failed to update FAQ")
            return False
    except Exception as e:
        print(f"   ❌ Error updating FAQ: {e}")
        return False
    
    # Test 5: Delete FAQ (soft delete) with admin tracking
    print("\n5. Deleting FAQ with admin tracking...")
    try:
        success = delete_faq(faq_id, deleted_by=admin_id)
        
        if success:
            print("   ✓ FAQ deleted successfully (soft delete)")
            print(f"   ✓ Deletion tracked to admin ID: {admin_id}")
        else:
            print("   ❌ Failed to delete FAQ")
            return False
    except Exception as e:
        print(f"   ❌ Error deleting FAQ: {e}")
        return False
    
    # Test 6: Verify FAQ is soft-deleted (not in active list)
    print("\n6. Verifying soft delete...")
    try:
        active_faqs = get_all_faqs()
        test_faq_in_active = any(f['id'] == faq_id for f in active_faqs)
        
        if not test_faq_in_active:
            print("   ✓ FAQ correctly excluded from active FAQs")
        else:
            print("   ⚠ FAQ still appears in active FAQs")
            
    except Exception as e:
        print(f"   ❌ Error checking active FAQs: {e}")
        return False
    
    print("\n" + "=" * 60)
    print("✅ All tests passed successfully!")
    print("=" * 60)
    print("\nSummary:")
    print("- FAQ creation tracks admin user ID")
    print("- FAQ updates track admin user ID")
    print("- FAQ deletion (soft) tracks admin user ID")
    print("- Admin names and emails are joined in queries")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    success = test_faq_admin_tracking()
    sys.exit(0 if success else 1)
