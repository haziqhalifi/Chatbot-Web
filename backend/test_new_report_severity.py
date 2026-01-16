"""Test that new reports get NULL severity by default"""
from database.reports import insert_report
from database.connection import DatabaseConnection
from types import SimpleNamespace
from datetime import datetime

# Create a test report
test_report = SimpleNamespace(
    user_id=6,  # Use existing user ID
    title="Test Report - Severity Check",
    location="Test Location",
    disaster_type="Flood",
    description="This is a test report to verify that severity is NULL by default when a new report is submitted.",
    created_at=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
)

print("Creating test report...")
result = insert_report(test_report)
print(f"✓ {result['message']}")

# Retrieve the latest report to verify severity is NULL
print("\nVerifying severity value...")
with DatabaseConnection() as conn:
    cursor = conn.cursor()
    cursor.execute("""
        SELECT TOP 1 id, title, severity 
        FROM disaster_reports 
        ORDER BY created_at DESC
    """)
    row = cursor.fetchone()
    cursor.close()
    
    if row:
        report_id, title, severity = row
        print(f"Latest report ID: {report_id}")
        print(f"Title: {title}")
        print(f"Severity: {severity if severity else 'NULL'}")
        
        if severity is None:
            print("\n✓ SUCCESS: Severity is NULL as expected!")
            print("  Admins will need to assign severity through the update modal.")
        else:
            print(f"\n✗ FAILED: Severity is '{severity}' instead of NULL")
            print("  The database still has a default constraint.")
    else:
        print("No reports found")

# Clean up - delete test report
print("\nCleaning up test report...")
with DatabaseConnection() as conn:
    cursor = conn.cursor()
    cursor.execute("""
        DELETE FROM disaster_reports 
        WHERE title = 'Test Report - Severity Check' 
        AND user_id = 6
    """)
    if not conn.autocommit:
        conn.commit()
    cursor.close()
print("✓ Test report deleted")
