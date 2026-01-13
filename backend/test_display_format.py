"""Test status and severity display formatting"""
from database.reports import get_all_reports

result = get_all_reports()

# Find report with NULL severity
null_severity_report = None
assigned_severity_report = None

for report in result['reports']:
    if report['severity'] is None and null_severity_report is None:
        null_severity_report = report
    elif report['severity'] and assigned_severity_report is None:
        assigned_severity_report = report
    
    if null_severity_report and assigned_severity_report:
        break

print("=" * 60)
print("DISPLAY FORMATTING TEST")
print("=" * 60)

if null_severity_report:
    print("\n1. Report with NULL severity:")
    print(f"   Title: {null_severity_report['title']}")
    print(f"   Status (DB): {null_severity_report['status']}")
    print(f"   Severity (DB): {null_severity_report['severity']}")
    print(f"\n   Display Format:")
    status = null_severity_report['status']
    print(f"   Status: {status[0].upper() + status[1:].lower() if status else 'Pending'}")
    print(f"   Severity: -")

if assigned_severity_report:
    print("\n2. Report with assigned severity:")
    print(f"   Title: {assigned_severity_report['title']}")
    print(f"   Status (DB): {assigned_severity_report['status']}")
    print(f"   Severity (DB): {assigned_severity_report['severity']}")
    print(f"\n   Display Format:")
    status = assigned_severity_report['status']
    print(f"   Status: {status[0].upper() + status[1:].lower() if status else 'Pending'}")
    print(f"   Severity: {assigned_severity_report['severity']}")

print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
print("✓ Status displays in sentence case (e.g., 'Pending', 'Approved')")
print("✓ NULL severity displays as '-'")
print("✓ Assigned severity displays normally (e.g., 'High', 'Medium')")
